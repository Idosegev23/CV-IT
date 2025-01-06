import type { Package } from '@/lib/store';

export interface FeatureConfig {
  icon: string;
  title: string;
  description: string;
  requiredPackage: Package;
  route: string;
}

export interface FeatureWithUpgrade extends FeatureConfig {
  key: string;
  upgradePrice: number;
} 