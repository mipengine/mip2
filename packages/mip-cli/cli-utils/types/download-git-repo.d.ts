declare function download (repo: string, dest: string, opts?: {clone: boolean}, cb: (err: Error) => void): void
export = download
