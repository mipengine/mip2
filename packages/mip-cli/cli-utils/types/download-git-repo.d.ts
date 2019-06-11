declare function download (repo: string, dest: string, opts: {clone: boolean}, fn: (err: Error) => void): void
export = download
