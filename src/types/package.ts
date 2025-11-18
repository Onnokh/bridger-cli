export interface LinkedPackage {
  name: string;
  target: string;
  version: string;
}

export type PackageLocation = 'local' | 'global' | 'auto';

