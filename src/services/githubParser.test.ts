import test from "node:test";
import assert from "node:assert/strict";
import {
  computeLanguageStats,
  parseProfileReadme,
  rankAndFilterRepos,
  type GitHubRepoRaw,
} from "./githubParser";

test("parseProfileReadme extracts headline, summary, education, highlights, and skills", () => {
  const md = `
# Hi, I'm Alizhan Toleukhan
[![Badge](https://img.shields.io/badge/swift-blue)]()

Building native iOS applications with SwiftUI, Flutter, FastAPI, and Solidity smart contracts.

- Studying Software Engineering at Astana IT University (AITU)
- Shipping real-time Computer Vision systems with YOLOv8 and Python
- Crafting WebGL experiences in Three.js and TypeScript
`;

  const parsed = parseProfileReadme(md);
  assert.equal(parsed.headline, "Hi, I'm Alizhan Toleukhan");
  assert.ok(parsed.summary?.includes("native iOS applications"));
  assert.ok(parsed.education?.includes("Astana IT University"));
  assert.equal(parsed.highlights.length, 3);
  assert.ok(parsed.skills.includes("SwiftUI"));
  assert.ok(parsed.skills.includes("Solidity"));
  assert.ok(parsed.skills.includes("Three.js"));
});

test("rankAndFilterRepos excludes empty forks & profile repo and prioritizes featured projects", () => {
  const repos: GitHubRepoRaw[] = [
    {
      id: 1,
      name: "Alizhan-T",
      description: "Profile README",
      html_url: "https://github.com/Alizhan-T/Alizhan-T",
      homepage: null,
      language: null,
      stargazers_count: 1,
      forks_count: 0,
      fork: false,
      size: 12,
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: 2,
      name: "empty-fork",
      description: null,
      html_url: "https://github.com/Alizhan-T/empty-fork",
      homepage: null,
      language: "JavaScript",
      stargazers_count: 0,
      forks_count: 0,
      fork: true,
      size: 100,
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: 3,
      name: "small-tool",
      description: "CLI helper",
      html_url: "https://github.com/Alizhan-T/small-tool",
      homepage: null,
      language: "Python",
      stargazers_count: 1,
      forks_count: 0,
      fork: false,
      size: 120,
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: 4,
      name: "Memechain",
      description: "Web3 meme token chain",
      html_url: "https://github.com/Alizhan-T/Memechain",
      homepage: "https://memechain.example.com",
      language: "Solidity",
      stargazers_count: 3,
      forks_count: 1,
      fork: false,
      size: 400,
      updated_at: "2026-07-01T00:00:00Z",
    },
    {
      id: 5,
      name: "FireWatch-AI",
      description: "Fire detection with YOLOv8",
      html_url: "https://github.com/Alizhan-T/FireWatch-AI",
      homepage: null,
      language: "Swift",
      stargazers_count: 5,
      forks_count: 2,
      fork: false,
      size: 900,
      updated_at: "2026-07-15T00:00:00Z",
    },
  ];

  const ranked = rankAndFilterRepos(repos, "Alizhan-T");
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].name, "FireWatch-AI");
  assert.equal(ranked[1].name, "Memechain");
  assert.equal(ranked[1].demoUrl, "https://memechain.example.com");
  assert.equal(ranked[2].name, "small-tool");

  const langStats = computeLanguageStats(repos);
  assert.equal(langStats.length, 3);
  assert.ok(langStats.every((l) => l.percent > 0));
});

test("inferCategory avoids substring false positives like methods or domain", () => {
  const edgeRepos: GitHubRepoRaw[] = [
    {
      id: 10,
      name: "numerical-methods-python",
      description: "Curve fitting and RK4 ODE modeling",
      html_url: "https://github.com/Alizhan-T/numerical-methods-python",
      homepage: null,
      language: "Python",
      stargazers_count: 0,
      forks_count: 0,
      fork: false,
      size: 200,
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: 11,
      name: "SmartCampus",
      description: "RBAC domain model and native iOS SwiftUI app",
      html_url: "https://github.com/Alizhan-T/SmartCampus",
      homepage: null,
      language: "Swift",
      stargazers_count: 0,
      forks_count: 0,
      fork: false,
      size: 300,
      updated_at: "2026-08-01T00:00:00Z",
    },
  ];
  const ranked = rankAndFilterRepos(edgeRepos, "Alizhan-T");
  const numMethods = ranked.find((r) => r.name === "numerical-methods-python");
  const smartCampus = ranked.find((r) => r.name === "SmartCampus");
  assert.equal(numMethods?.category, "Full-Stack Web");
  assert.equal(smartCampus?.category, "Mobile (iOS / Flutter)");
});

