export interface IPackageOption {
    dir: string;
    outputName?: '';
    banner: string;
    external: string[];
}


export interface IPackageConfig {
    workspace: string;
    dir: string;
    fullPath: string;
    packageConfig: Record<string, any>;
}
