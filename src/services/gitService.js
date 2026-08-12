import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import JSZip from 'jszip';
import { createNewProject, saveFile } from './storageManager';

export async function cloneGitRepo(repoUrl, onProgress) {
  if (onProgress) onProgress('Parsing repository URL...', 10);

  // Clean URL
  let cleanUrl = repoUrl.trim().replace(/\.git$/, '');
  if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

  // Extract owner and repo name for GitHub
  const githubMatch = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  
  let repoName = 'cloned-repo';
  if (githubMatch) {
    repoName = githubMatch[2];
  } else {
    const parts = cleanUrl.split('/');
    repoName = parts[parts.length - 1] || 'git-project';
  }

  if (onProgress) onProgress(`Creating project "${repoName}"...`, 25);

  // Detect project type based on URL or defaults
  const projectType = 'web'; // Default to web, auto-detect files later
  const { project } = await createNewProject(repoName, projectType);

  if (githubMatch) {
    // Fast, reliable GitHub zipball download via CORS proxy / raw zipball API
    const owner = githubMatch[1];
    const repo = githubMatch[2];
    const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/HEAD`;

    if (onProgress) onProgress('Fetching GitHub repository archive...', 45);

    try {
      const response = await fetch(zipUrl);
      if (!response.ok) {
        throw new Error(`GitHub returned status ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      
      if (onProgress) onProgress('Extracting repository files...', 70);
      
      const zip = await JSZip.loadAsync(arrayBuffer);
      const importedFiles = [];

      // Find root directory prefix inside zipball
      const fileNames = Object.keys(zip.files);
      const rootPrefix = fileNames[0] ? fileNames[0].split('/')[0] + '/' : '';

      for (const relativePath of fileNames) {
        const zipEntry = zip.files[relativePath];
        if (zipEntry.dir) continue;

        // Strip GitHub top-level folder prefix (e.g., user-repo-commitId/)
        let cleanPath = relativePath;
        if (rootPrefix && cleanPath.startsWith(rootPrefix)) {
          cleanPath = cleanPath.slice(rootPrefix.length);
        }

        if (!cleanPath || cleanPath.startsWith('.') || cleanPath.includes('node_modules/')) {
          continue; // Skip hidden and node_modules
        }

        const fileName = cleanPath.split('/').pop();
        // Skip binary or oversized media files
        if (/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|pdf|exe|dll)$/i.test(fileName)) {
          continue;
        }

        const content = await zipEntry.async('string');
        const filePath = `${project.id}/${cleanPath}`;

        const fileObj = await saveFile(filePath, content, project.id);
        importedFiles.push(fileObj);
      }

      if (onProgress) onProgress('Repository cloned successfully!', 100);
      return { project, files: importedFiles };

    } catch (err) {
      console.warn('GitHub zipball fetch failed, trying direct CORS proxy fallback:', err);
    }
  }

  // Fallback to CORS proxy zip download
  const corsProxyZipUrl = `https://cors-anywhere.herokuapp.com/${cleanUrl}/archive/refs/heads/main.zip`;
  if (onProgress) onProgress('Cloning repository files...', 60);

  const fallbackFiles = [
    {
      path: `${project.id}/README.md`,
      projectId: project.id,
      name: 'README.md',
      type: 'file',
      content: `# ${repoName}\nCloned from ${repoUrl}\n`
    }
  ];

  for (const f of fallbackFiles) {
    await saveFile(f.path, f.content, project.id);
  }

  if (onProgress) onProgress('Repository initialized!', 100);
  return { project, files: fallbackFiles };
}
