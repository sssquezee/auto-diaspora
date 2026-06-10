/**
 * Country (ISO code) → major cities, for the listing form's city picker.
 *
 * Used as <datalist> suggestions keyed off the selected country: the user
 * can pick a city from the list OR type their own (so sellers in smaller
 * towns aren't excluded). City names are in local Latin script — the form
 * stores whatever string ends up in the field.
 *
 * Country codes match COUNTRIES in the listing form / Sidebar filters.
 */

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  AT: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Sankt Pölten", "Dornbirn", "Wiener Neustadt", "Steyr", "Feldkirch", "Bregenz"],
  BE: ["Brussel", "Antwerpen", "Gent", "Charleroi", "Liège", "Brugge", "Namur", "Leuven", "Mons", "Mechelen", "Aalst", "Hasselt", "Kortrijk", "Oostende", "Genk", "Sint-Niklaas"],
  BG: ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven", "Sliven", "Dobrich", "Shumen", "Pernik", "Haskovo", "Yambol", "Pazardzhik", "Blagoevgrad", "Veliko Tarnovo"],
  CH: ["Zürich", "Genève", "Basel", "Lausanne", "Bern", "Winterthur", "Luzern", "St. Gallen", "Lugano", "Biel/Bienne", "Thun", "Fribourg", "Schaffhausen", "Chur", "Neuchâtel"],
  CZ: ["Praha", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "Ústí nad Labem", "Hradec Králové", "České Budějovice", "Pardubice", "Zlín", "Havířov", "Kladno", "Most", "Karviná", "Opava"],
  DE: ["Berlin", "Hamburg", "München", "Köln", "Frankfurt am Main", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster", "Karlsruhe", "Mannheim", "Augsburg", "Wiesbaden", "Mönchengladbach", "Gelsenkirchen", "Aachen", "Braunschweig", "Kiel", "Chemnitz", "Halle", "Magdeburg", "Freiburg", "Krefeld", "Mainz", "Lübeck", "Erfurt", "Rostock", "Kassel", "Saarbrücken"],
  DK: ["København", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde", "Herning", "Helsingør", "Silkeborg", "Næstved"],
  EE: ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Maardu", "Sillamäe", "Kuressaare"],
  ES: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma", "Las Palmas", "Bilbao", "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón", "Granada", "A Coruña", "Vitoria-Gasteiz", "Elche", "Oviedo", "Santander", "Pamplona", "Almería", "San Sebastián", "Marbella", "Tarragona", "Cádiz", "Cartagena"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio", "Pori", "Joensuu", "Lappeenranta", "Vaasa", "Kotka", "Rovaniemi"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille", "Rennes", "Reims", "Le Havre", "Saint-Étienne", "Toulon", "Grenoble", "Dijon", "Angers", "Nîmes", "Villeurbanne", "Clermont-Ferrand", "Le Mans", "Aix-en-Provence", "Brest", "Tours", "Amiens", "Limoges", "Annecy", "Metz", "Besançon", "Caen", "Orléans", "Mulhouse", "Rouen", "Nancy"],
  GR: ["Athína", "Thessaloniki", "Patra", "Piraeus", "Larisa", "Heraklion", "Volos", "Ioannina", "Chania", "Rhodes", "Kavala", "Agrinio", "Katerini", "Trikala"],
  HR: ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Pula", "Slavonski Brod", "Karlovac", "Varaždin", "Šibenik", "Dubrovnik", "Sisak", "Vinkovci"],
  HU: ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely", "Sopron", "Szolnok", "Tatabánya", "Kaposvár"],
  IE: ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan", "Kilkenny", "Sligo"],
  IT: ["Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", "Venezia", "Verona", "Messina", "Padova", "Trieste", "Brescia", "Parma", "Modena", "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno", "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara", "Sassari", "Bergamo", "Pescara", "Vicenza", "Bolzano"],
  LT: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai", "Jonava", "Utena"],
  LU: ["Luxembourg", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck", "Diekirch"],
  LV: ["Rīga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Ventspils", "Rēzekne", "Valmiera", "Jēkabpils", "Ogre"],
  NL: ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen", "Tilburg", "Almere", "Breda", "Nijmegen", "Apeldoorn", "Haarlem", "Arnhem", "Enschede", "Amersfoort", "Zwolle", "'s-Hertogenbosch", "Maastricht", "Leiden", "Dordrecht"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Tromsø", "Sandnes", "Bodø", "Ålesund", "Sarpsborg", "Skien"],
  PL: ["Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice", "Białystok", "Gdynia", "Częstochowa", "Radom", "Sosnowiec", "Toruń", "Kielce", "Rzeszów", "Gliwice", "Zabrze", "Olsztyn", "Bielsko-Biała", "Rybnik", "Opole", "Tychy", "Gorzów Wielkopolski", "Płock", "Elbląg"],
  PT: ["Lisboa", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Coimbra", "Funchal", "Setúbal", "Faro", "Aveiro", "Évora", "Guimarães", "Viseu", "Leiria"],
  RO: ["București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea", "Brăila", "Arad", "Pitești", "Sibiu", "Bacău", "Târgu Mureș", "Baia Mare", "Buzău"],
  SE: ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping", "Lund", "Umeå", "Gävle", "Borås", "Södertälje", "Eskilstuna"],
  SI: ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje", "Koper", "Novo Mesto", "Ptuj", "Nova Gorica", "Murska Sobota"],
  SK: ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Trenčín", "Martin", "Poprad", "Prievidza", "Zvolen"],
};

export function getCitiesForCountry(country: string | undefined): string[] {
  if (!country) return [];
  return CITIES_BY_COUNTRY[country] ?? [];
}
