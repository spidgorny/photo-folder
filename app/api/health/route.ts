import { NextResponse } from 'next/server';
import os from 'os';
import { version as nodeVersion } from 'process';
import fs from 'fs';

// Get Next.js version from package.json
let nextjsVersion = 'unknown';
try {
  const packageJson = require('../../../package.json');
  nextjsVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next || 'unknown';
} catch (error) {
  console.error('Could not read package.json:', error);
}

export async function GET() {
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model || 'unknown';
  const cpuCount = cpus.length;
  
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);

  const memoryUsage = process.memoryUsage();
  const memoryFormatted = {
    rss: formatBytes(memoryUsage.rss),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    external: formatBytes(memoryUsage.external),
  };

  const systemInfo = {
    timestamp: new Date().toISOString(),
    app: {
      name: 'Photo Folder',
      nextjsVersion,
      nodeVersion: nodeVersion,
      environment: process.env.NODE_ENV || 'development',
    },
    system: {
      platform: os.platform(),
      osRelease: os.release(),
      osType: os.type(),
      architecture: os.arch(),
      hostname: os.hostname(),
      cpuModel,
      cpuCount,
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
    },
    process: {
      pid: process.pid,
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptime),
      memory: memoryFormatted,
    },
    funFacts: {
      totalCores: cpuCount,
      memoryPerCore: formatBytes(os.totalmem() / cpuCount),
      nodeArchitecture: process.arch || 'unknown',
      isDocker: checkDocker(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  return NextResponse.json(systemInfo);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

function checkDocker(): boolean {
  try {
    return fs.existsSync('/.dockerenv') || 
           fs.existsSync('/proc/1/cgroup') && 
           fs.readFileSync('/proc/1/cgroup', 'utf8').includes('/docker');
  } catch {
    return false;
  }
}
