import {Globe2} from 'lucide-react';
import {createContext, useContext, useEffect, useMemo, useState} from 'react';

export type Language = 'en' | 'sv';
type I18nValue = {language: Language; setLanguage: (language: Language) => void};
const I18nContext = createContext<I18nValue>({language: 'en', setLanguage: () => undefined});

const sv: Record<string, string> = {
  'Sign in': 'Logga in',
  'Join PlayNest': 'Gå med i PlayNest',
  'PlayNest': 'PlayNest',
  'Local plans, made together': 'Lokala planer, skapade tillsammans',
  'More play nearby.': 'Mer lek i närheten.',
  'Less planning alone.': 'Mindre planering på egen hand.',
  'Discover guardian-attended playground meetups, park activities and family events near you.': 'Upptäck lekplatsträffar, parkaktiviteter och familjeevenemang nära dig där vårdnadshavare deltar.',
  'Explore local events': 'Utforska lokala aktiviteter',
  'Host a playdate': 'Ordna en lekträff',
  'Public venues. Guardians always stay. Your children are never listed publicly.': 'Offentliga platser. Vårdnadshavare stannar alltid. Dina barn visas aldrig offentligt.',
  'Nearby by design': 'Nära från början',
  'Browse by locality, never live location.': 'Sök efter område, aldrig efter liveposition.',
  'Safety built in': 'Trygghet inbyggd',
  'Public venues and guardian attendance only.': 'Endast offentliga platser och närvarande vårdnadshavare.',
  'Trust grows slowly': 'Förtroende växer med tiden',
  'Requests, moderation and privacy controls.': 'Förfrågningar, moderering och integritetskontroller.',
  'See what’s possible': 'Se vad som är möjligt',
  'A friendly reason to get outside': 'En trevlig anledning att gå ut',
  'Explore all': 'Utforska alla',
  'How it works': 'Så fungerar det',
  'Simple plans. Clear expectations.': 'Enkla planer. Tydliga förväntningar.',
  'Find your locality': 'Hitta ditt område',
  'Request a place': 'Be om en plats',
  'Meet in public': 'Träffas offentligt',
  'Starting locally': 'Vi börjar lokalt',
  'Common questions': 'Vanliga frågor',
  'Good to know': 'Bra att veta',
  'Is PlayNest a childcare service?': 'Är PlayNest en barnomsorgstjänst?',
  'Can people browse my child’s profile?': 'Kan andra se mitt barns profil?',
  'Are organizers background checked?': 'Bakgrundskontrolleras arrangörer?',
  'Thoughtful local connections for families.': 'Trygga lokala kontakter för familjer.',
  'Safety': 'Trygghet',
  'Privacy': 'Integritet',
  'Community': 'Gemenskap',
  'Terms': 'Villkor',
  'Discover': 'Upptäck',
  'Create': 'Skapa',
  'My activities': 'Mina aktiviteter',
  'Notifications': 'Aviseringar',
  'Your account': 'Ditt konto',
  'Log out': 'Logga ut',
  'What’s happening nearby?': 'Vad händer i närheten?',
  'Browse real activities published by local organizers.': 'Se riktiga aktiviteter publicerade av lokala arrangörer.',
  'Search activities': 'Sök aktiviteter',
  'Upcoming events': 'Kommande aktiviteter',
  'Past events': 'Tidigare aktiviteter',
  'Completed activities': 'Avslutade aktiviteter',
  'No matching events': 'Inga matchande aktiviteter',
  'No events match your current search and filters. Try broadening them.': 'Inga aktiviteter matchar din sökning och dina filter. Prova att bredda dem.',
  'Clear filters': 'Rensa filter',
  'Playdates are starting in this area.': 'Lekträffar börjar dyka upp i området.',
  'There are no upcoming events yet. Host the first event or invite another parent.': 'Det finns inga kommande aktiviteter ännu. Skapa den första eller bjud in en annan förälder.',
  'Host the first event': 'Skapa den första aktiviteten',
  'All localities': 'Alla områden',
  'All ages': 'Alla åldrar',
  'Any date': 'Alla datum',
  'Indoor & outdoor': 'Inomhus och utomhus',
  'Indoor': 'Inomhus',
  'Outdoor': 'Utomhus',
  'Today': 'I dag',
  'This weekend': 'Denna helg',
  'Next week': 'Nästa vecka',
  'Localities': 'Områden',
  'Age groups': 'Åldersgrupper',
  'Dates': 'Datum',
  'Settings': 'Inställningar',
  'All selected': 'Alla valda',
  'Back to discover': 'Tillbaka till Upptäck',
  'When & where': 'När och var',
  'About this activity': 'Om aktiviteten',
  'Capacity': 'Kapacitet',
  'Suitable ages': 'Lämpliga åldrar',
  'Supervision': 'Tillsyn',
  'Guardian required': 'Vårdnadshavare krävs',
  'Languages': 'Språk',
  'Setting': 'Miljö',
  'Directions': 'Vägbeskrivning',
  'Download .ics': 'Ladda ner .ics',
  'Google Calendar': 'Google Kalender',
  'Share event': 'Dela aktivitet',
  'Event full': 'Aktiviteten är full',
  'This event has ended': 'Aktiviteten har avslutats',
  'You created this event': 'Du skapade aktiviteten',
  'Join waitlist': 'Gå med i väntelistan',
  'Guardian attending': 'Vårdnadshavare deltar',
  'Event completed': 'Aktiviteten är avslutad',
  'Email-authenticated host': 'E-postverifierad värd',
  'Create a playdate': 'Skapa en lekträff',
  'Event details': 'Aktivitetsuppgifter',
  'Title': 'Titel',
  'Description': 'Beskrivning',
  'Category': 'Kategori',
  'Start date and time': 'Startdatum och tid',
  'End date and time': 'Slutdatum och tid',
  'Locality': 'Område',
  'Venue': 'Plats',
  'Suitable age bands': 'Lämpliga åldersgrupper',
  'Maximum children': 'Max antal barn',
  'Siblings are welcome': 'Syskon är välkomna',
  'Environment': 'Miljö',
  'Languages spoken': 'Språk som talas',
  'Accessibility notes (optional)': 'Tillgänglighetsinformation (valfritt)',
  'What to bring (optional)': 'Vad man ska ta med (valfritt)',
  'Approval mode': 'Godkännandeläge',
  'Automatically accept requests while places are available': 'Godkänn förfrågningar automatiskt när platser finns',
  'Review every request manually': 'Granska varje förfrågan manuellt',
  'Publish event': 'Publicera aktivitet',
  'Upcoming': 'Kommande',
  'Pending': 'Väntande',
  'Waitlisted': 'På väntelista',
  'Place offers': 'Platserbjudanden',
  'Hosted': 'Arrangerade',
  'No activities here yet': 'Inga aktiviteter här ännu',
  'What’s new': 'Vad är nytt',
  'Mark all as read': 'Markera alla som lästa',
  'Clear all': 'Rensa alla',
  'You’re all caught up': 'Du är helt uppdaterad',
  'Account preferences': 'Kontoinställningar',
  'Save settings': 'Spara inställningar',
  'Profile': 'Profil',
  'Edit profile': 'Redigera profil',
  'Save changes': 'Spara ändringar',
  'Add child profile': 'Lägg till barnprofil',
  'Welcome back': 'Välkommen tillbaka',
  'Sign in to PlayNest': 'Logga in på PlayNest',
  'Continue to your activities and local events.': 'Fortsätt till dina aktiviteter och lokala evenemang.',
  'Email': 'E-post',
  'Password': 'Lösenord',
  'Forgot password?': 'Glömt lösenordet?',
  'New here? Create an account': 'Ny här? Skapa ett konto',
  'Create your account': 'Skapa ditt konto',
  'Create account': 'Skapa konto',
  'Already have an account? Sign in': 'Har du redan ett konto? Logga in',
  'Please wait…': 'Vänta…',
  'Loading events…': 'Laddar aktiviteter…',
  'Loading notifications…': 'Laddar aviseringar…',
  'Cancel': 'Avbryt',
  'Continue': 'Fortsätt',
  'Back': 'Tillbaka',
  'Delete my event': 'Ta bort min aktivitet',
  'Report this event': 'Rapportera aktiviteten',
  'Privacy policy': 'Integritetspolicy',
  'Safety at PlayNest': 'Trygghet på PlayNest',
  'Community rules': 'Gemenskapsregler',
  'Terms of service': 'Användarvillkor',
  'PlayNest policies': 'PlayNests policyer',
  'Beta notice:': 'Beta-information:',
  'These concise policies are starter text and should be reviewed by qualified Swedish/EU counsel before a public launch.': 'Dessa kortfattade policyer är preliminära och bör granskas av kvalificerad svensk/EU-jurist före en offentlig lansering.',
  'We collect only the adult account and minimal child-profile information needed to coordinate activities. We do not collect child surnames, photos, exact birth dates, schools, home addresses or live location. Child profiles are never publicly searchable. You may request account deletion from Profile.': 'Vi samlar endast in vuxenkontot och den minimala information om barnprofiler som behövs för att samordna aktiviteter. Vi samlar inte in barns efternamn, foton, exakta födelsedatum, skolor, hemadresser eller liveposition. Barnprofiler är aldrig offentligt sökbara. Du kan begära att kontot tas bort under Profil.',
  'Every activity is guardian-attended and held at a public venue. PlayNest is not childcare, does not support drop-off, and does not perform or claim background checks. Each guardian remains responsible for their own children. Report concerning users or events promptly.': 'Varje aktivitet sker med vårdnadshavare närvarande och på en offentlig plats. PlayNest är inte barnomsorg, stödjer inte lämning och utför eller utlovar inga bakgrundskontroller. Varje vårdnadshavare ansvarar för sina egna barn. Rapportera oroande användare eller aktiviteter omgående.',
  'Be respectful, accurate and inclusive. Use public venues. Keep guardians present. Do not share another family’s personal information, photograph children without consent, or use PlayNest for childcare exchanges. Reports are reviewed and violations may lead to suspension.': 'Var respektfull, korrekt och inkluderande. Använd offentliga platser och ha vårdnadshavare närvarande. Dela inte andra familjers personuppgifter, fotografera inte barn utan samtycke och använd inte PlayNest för barnomsorg. Rapporter granskas och överträdelser kan leda till avstängning.',
  'PlayNest helps adults coordinate family activities. It does not supervise events or guarantee any member’s identity, conduct or suitability. You must be at least 18, use accurate information, follow local law and remain responsible for your children.': 'PlayNest hjälper vuxna att samordna familjeaktiviteter. Tjänsten övervakar inte aktiviteter och garanterar inte någon medlems identitet, beteende eller lämplighet. Du måste vara minst 18 år, lämna korrekta uppgifter, följa lokal lag och fortsätta ansvara för dina barn.',
  'Create a simple local plan': 'Skapa en enkel lokal plan',
  'Public venues only. Guardians are always required.': 'Endast offentliga platser. Vårdnadshavare måste alltid delta.',
  'Activity category': 'Aktivitetskategori',
  'Choose': 'Välj',
  'Public venue address': 'Adress till offentlig plats',
  'Venue or park, street and city': 'Plats eller park, gata och stad',
  'No floor, apartment, home address or door code.': 'Ange inte våning, lägenhet, hemadress eller portkod.',
  'Start date': 'Startdatum',
  'Start time': 'Starttid',
  'End date': 'Slutdatum',
  'End time': 'Sluttid',
  'Age bands': 'Åldersgrupper',
  'Choose age bands': 'Välj åldersgrupper',
  'Select one or more.': 'Välj en eller flera.',
  'Maximum adults': 'Max antal vuxna',
  'Both': 'Båda',
  'Manual approval': 'Manuellt godkännande',
  'Automatic until full': 'Automatiskt tills det är fullt',
  'What to bring': 'Vad ska tas med',
  'Guardian attendance required': 'Vårdnadshavare måste delta',
  'Every guardian remains responsible for their own children.': 'Varje vårdnadshavare ansvarar för sina egna barn.',
  'Publish activity': 'Publicera aktivitet',
  'Publishing…': 'Publicerar…',
  'Your activity is published': 'Din aktivitet är publicerad',
  'It is now visible in Discover and a confirmation was added to Notifications.': 'Den visas nu under Upptäck och en bekräftelse har lagts till i Aviseringar.',
  'View event': 'Visa aktivitet',
  'Open Discover': 'Öppna Upptäck',
  'Hosting': 'Arrangerar',
  'Past': 'Tidigare',
  'Cancelled': 'Avbrutna',
  'Your plans in one place': 'Dina planer på ett ställe',
  'Activity status': 'Aktivitetsstatus',
  'Loading your activities…': 'Laddar dina aktiviteter…',
  'Create an event': 'Skapa en aktivitet',
  'Discover activities': 'Upptäck aktiviteter',
  'Your family settings': 'Dina familjeinställningar',
  'Your profile': 'Din profil',
  'Add a short bio so other parents know a little about you.': 'Lägg till en kort presentation så att andra föräldrar lär känna dig lite.',
  'Display name': 'Visningsnamn',
  'Bio': 'Presentation',
  'A little about you and your family': 'Lite om dig och din familj',
  'Separate languages with commas.': 'Separera språk med kommatecken.',
  'Save profile': 'Spara profil',
  'Child profiles': 'Barnprofiler',
  'Use only a nickname or first name and broad age band. Profiles are never publicly searchable.': 'Använd endast smeknamn eller förnamn och en bred åldersgrupp. Profiler är aldrig offentligt sökbara.',
  'Nickname or first name': 'Smeknamn eller förnamn',
  'Do not enter a surname.': 'Ange inte efternamn.',
  'Age band': 'Åldersgrupp',
  'Interests (optional)': 'Intressen (valfritt)',
  'Participation notes (optional)': 'Deltagandeinformation (valfritt)',
  'Save child profile': 'Spara barnprofil',
  'Loading profiles…': 'Laddar profiler…',
  'No child profiles yet.': 'Inga barnprofiler ännu.',
  'Account': 'Konto',
  'Delete account': 'Ta bort konto',
  'Reset password': 'Återställ lösenord',
  'Notifications settings': 'Aviseringsinställningar',
  'In-app notifications': 'Aviseringar i appen',
  'Event update emails': 'E-post om aktivitetsuppdateringar',
  'Request emails': 'E-post om förfrågningar',
  'Nearby activity alerts': 'Aviseringar om aktiviteter i närheten',
  'Loading settings…': 'Laddar inställningar…',
  'Saving…': 'Sparar…',
};

const patterns: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^Hosted by (.+)$/, m => `Värd: ${m[1]}`],
  [/^(\d+) available$/, m => `${m[1]} tillgängliga`],
  [/^(\d+) selected$/, m => `${m[1]} valda`],
  [/^(\d+) of (\d+) places remaining$/, m => `${m[1]} av ${m[2]} platser kvar`],
  [/^(.+) years$/, m => `${m[1]} år`],
  [/^Past event$/, () => 'Tidigare aktivitet'],
];

function translate(value: string) {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.trim();
  if (!core) return value;
  const direct = sv[core];
  if (direct) return `${leading}${direct}${trailing}`;
  for (const [pattern, replacement] of patterns) {
    const match = core.match(pattern);
    if (match) return `${leading}${replacement(match)}${trailing}`;
  }
  return value;
}

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function localize(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    if (!node.parentElement?.closest('[data-no-translate]')) {
      const stored = originalText.get(node);
      const original = stored && (node.data === stored || node.data === translate(stored)) ? stored : node.data;
      originalText.set(node, original);
      const next = language === 'sv' ? translate(original) : original;
      if (node.data !== next) node.data = next;
    }
    node = walker.nextNode() as Text | null;
  }

  const elements = root instanceof Element ? [root, ...root.querySelectorAll('*')] : [...root.querySelectorAll('*')];
  for (const element of elements) {
    for (const attribute of ['placeholder', 'title', 'aria-label']) {
      const current = element.getAttribute(attribute);
      if (!current) continue;
      let originals = originalAttributes.get(element);
      if (!originals) {
        originals = new Map();
        originalAttributes.set(element, originals);
      }
      const original = originals.get(attribute) ?? current;
      originals.set(attribute, original);
      element.setAttribute(attribute, language === 'sv' ? translate(original) : original);
    }
  }
}

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem('playnest-language') === 'sv' ? 'sv' : 'en');
  const setLanguage = (next: Language) => {
    localStorage.setItem('playnest-language', next);
    setLanguageState(next);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    const apply = (root: ParentNode = document.body) => localize(root, language);
    apply();
    const observer = new MutationObserver(records => {
      observer.disconnect();
      for (const record of records) {
        if (record.type === 'characterData' && record.target.parentNode) apply(record.target.parentNode);
        record.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) apply(node as ParentNode);
          else if (node.parentNode) apply(node.parentNode);
        });
      }
      observer.observe(document.body, {subtree: true, childList: true, characterData: true});
    });
    observer.observe(document.body, {subtree: true, childList: true, characterData: true});
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({language, setLanguage}), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  return useContext(I18nContext);
}

export function LanguageSwitcher() {
  const {language, setLanguage} = useLanguage();
  return <div className="language-switcher" data-no-translate>
    <Globe2 aria-hidden="true"/>
    <label htmlFor="playnest-language" className="sr-only">Language</label>
    <select id="playnest-language" value={language} onChange={event => setLanguage(event.target.value as Language)} aria-label="Language">
      <option value="en">EN</option>
      <option value="sv">SV</option>
    </select>
  </div>;
}
