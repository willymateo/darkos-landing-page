// What we build. Each capability sits against the problem it solves: the
// problem on the "today" side of the seam, the build on the DarkOS side.
export const BUILD: { name: string; problem: string; desc: string }[] = [
  {
    name: "Agentic platforms",
    problem: "Work that needs judgment waits in someone's queue.",
    desc: "Agents that plan the work, call your tools and APIs, and hand off to a person when judgment is needed.",
  },
  {
    name: "Deep agents",
    problem: "Hard problems take days of research before anyone can act.",
    desc: "Agents that use the full reasoning power of today's models: they read the context and the environment, break complex problems into steps and see them through.",
  },
  {
    name: "Agentic systems in the cloud",
    problem: "Useful tools live on one person's machine, out of reach for everyone else.",
    desc: "Systems that run in the cloud, so your team can reach them from anywhere, at any hour.",
  },
  {
    name: "Retrieval over your data",
    problem: "The answer is somewhere in your documents, and nobody can find it.",
    desc: "Agents grounded in your own documents and data, with answers that show where they came from.",
  },
  {
    name: "Workflow automation",
    problem: "People spend their day copying data from one system into another.",
    desc: "Automation across the systems you already run, so the work moves without someone carrying it.",
  },
  {
    name: "Evaluation, monitoring and cost controls",
    problem: "Nobody can say whether the AI is right, or what it costs each month.",
    desc: "Every agent is measured before release and watched after it, with budgets that stop runaway spend.",
  },
  {
    name: "Model-agnostic infrastructure",
    problem: "You are locked into one AI vendor, its roadmap and its prices.",
    desc: "Infrastructure in your cloud that lets you change models without rewriting the product.",
  },
];

export const CAPABILITY_NAMES: readonly string[] = BUILD.map((b) => b.name);
