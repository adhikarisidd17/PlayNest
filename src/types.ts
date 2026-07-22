export type AgeBand='0–2'|'3–5'|'6–8'|'9–12'|'13+';
export type EventStatus='published'|'cancelled'|'completed';
export interface Locality {id:string;name:string;city:string;country_code:string;timezone:string}
export interface Venue {id:string;name:string;address_text:string;directions_url?:string}
export interface PlayEvent {id:string;organizer_id?:string;locality_id:string;venue_id?:string;title:string;description:string;category:string;starts_at:string;ends_at:string;timezone:string;age_bands:AgeBand[];max_children:number;accepted_children?:number;siblings_allowed:boolean;guardian_required:true;environment:'indoor'|'outdoor'|'both';languages:string[];accessibility_notes?:string;bring_notes?:string;cancellation_deadline?:string;approval_mode:'manual'|'automatic';registration_status:'open'|'closed';status:EventStatus;is_example:boolean;completed_at?:string;organizer_name?:string;community_vouched?:boolean;venue?:Venue;locality?:Locality}
export interface Child {id:string;nickname:string;age_band:AgeBand;interests:string[];participation_notes?:string}
export interface NotificationPayload {userId:string;type:string;title:string;body:string;actionUrl?:string}
