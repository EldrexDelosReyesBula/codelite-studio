import React from 'react';

const features = [
  {
    title: 'Python in your browser',
    description: 'Run Python with Pyodide, NumPy, and Matplotlib without setting up a local runtime.'
  },
  {
    title: 'Build and preview web projects',
    description: 'Edit HTML, CSS, and JavaScript, then preview the active HTML file as you work.'
  },
  {
    title: 'Your workspace stays local',
    description: 'Projects are stored in your browser and can be imported or exported as ZIP archives.'
  }
];

export default function SeoLanding() {
  return (
    <main className="seo-landing">
      <header className="seo-landing-header">
        <img
          src="/assets/codelite-studio-logo-transparent.png"
          alt=""
          width="48"
          height="48"
        />
        <span>CodeLite Studio</span>
      </header>
      <section className="seo-landing-hero" aria-labelledby="seo-landing-title">
        <p className="seo-landing-eyebrow">A coding workspace for the browser</p>
        <h1 id="seo-landing-title">Write, run, and preview code on any device.</h1>
        <p>
          CodeLite Studio brings Python execution and web development tools into
          a browser-based IDE, with a responsive editor and locally stored projects.
        </p>
        <a className="seo-landing-cta" href="#workspace">Open CodeLite Studio</a>
      </section>
      <section className="seo-landing-features" aria-label="CodeLite Studio features">
        {features.map(feature => (
          <article className="seo-landing-card" key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>
      <noscript>
        <p className="seo-landing-noscript">
          JavaScript is required to open the interactive coding workspace.
        </p>
      </noscript>
    </main>
  );
}
