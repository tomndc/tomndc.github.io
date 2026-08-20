export const ICON_SLUGS: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  nodejs: "nodedotjs",
  expressjs: "express",
  python: "python",
  php: "php",
  laravel: "laravel",
  wordpress: "wordpress",
  postgresql: "postgresql",
  prisma: "prisma",
  mariadb:"mariadb",
  mongoose: "mongoose",
  vite: "vite",
  websockets: "socketdotio",
  "socket.io": "socketdotio",
  swagger: "swagger",
  "google api": "google",
};

export function iconUrlFor(label: string): string | undefined {
  const slug = ICON_SLUGS[label.toLowerCase()];
  return slug ? `https://cdn.simpleicons.org/${slug}` : undefined;
}
