export function removeComments(data : string ) : string {
    return data.replace(/(--).*/g, '')
}

export function splitToQueries(data: string) : string[] {
    return data.split(/\s*;\s*/)
}