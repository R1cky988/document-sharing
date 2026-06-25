import { FILE_ICONS } from "../constants/fileConstants";

const generateMockDocs = () => {
  const types = ["PDF", "IMAGE", "WORD", "EXCEL"];
  const perms = ["OWNER", "VIEW"];

  const names = [
    "Q4 Financial Report",
    "Brand Guidelines 2024",
    "Product Roadmap",
    "Team OKRs",
    "Design System",
    "API Documentation",
    "Marketing Deck",
    "User Research",
    "Sales Playbook",
    "Engineering RFC",
    "Onboarding Guide",
    "Budget Forecast",
    "Competitive Analysis",
    "Sprint Retrospective",
    "Release Notes",
  ];

  return names.map((name, i) => ({
    id: i + 1,
    name,
    contentType: types[i % 4],
    size: `${(Math.random() * 9 + 0.5).toFixed(1)} MB`,
    createdAt: new Date(Date.now() - Math.random() * 1e10).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    owner: i % 3 === 0 ? "alex.monroe@acme.io" : ["jordan.k@acme.io", "sam.wu@acme.io"][i % 2],
    permission: perms[i % 2],
    starred: i % 5 === 0,
    content: `This is a simulated preview of "${name}". In production, this would render the actual file content using a document viewer SDK or embedded iframe based on file type.`,
  }));
};

export const ALL_DOCS = generateMockDocs();
