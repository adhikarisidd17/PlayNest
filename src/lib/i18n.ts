export type Locale='en'|'sv';
const copy={en:{discover:'Discover',create:'Create',activities:'My activities',notifications:'Notifications',profile:'Profile',guardian:'Guardian attending',places:'places left',example:'Example event'},sv:{discover:'Upptäck',create:'Skapa',activities:'Mina aktiviteter',notifications:'Notiser',profile:'Profil',guardian:'Vårdnadshavare deltar',places:'platser kvar',example:'Exempelevent'}} as const;
export const t=(locale:Locale,key:keyof typeof copy.en)=>copy[locale][key];
