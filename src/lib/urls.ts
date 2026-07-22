export function publicOrigin(){return((import.meta.env.VITE_PUBLIC_APP_URL as string|undefined)?.trim().replace(/\/$/,'')||window.location.origin)}
export function passwordRecoveryUrl(){return`${publicOrigin()}/reset-password`}
