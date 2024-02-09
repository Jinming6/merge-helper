export function warn(msg: string): void {
  console.warn(`[${process.env.PACKAGE_NAME} warn] ${msg}`);
}
