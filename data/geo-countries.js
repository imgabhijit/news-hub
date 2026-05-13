// World countries, ambiguous cases, and world regions data

const COUNTRIES_RAW = [
  {name:"Afghanistan",flag:"🇦🇫",kw:["afghanistan","afghan","kabul","taliban","kandahar","helmand"]},
  {name:"Albania",flag:"🇦🇱",kw:["albania","albanian","tirana"]},
  {name:"Algeria",flag:"🇩🇿",kw:["algeria","algerian","algiers","oran"]},
  {name:"Andorra",flag:"🇦🇩",kw:["andorra"]},
  {name:"Angola",flag:"🇦🇴",kw:["angola","angolan","luanda"]},
  {name:"Antigua and Barbuda",flag:"🇦🇬",kw:["antigua","barbuda"]},
  {name:"Argentina",flag:"🇦🇷",kw:["argentina","argentine","argentinian","buenos aires","patagonia","mendoza","rosario","milei"]},
  {name:"Armenia",flag:"🇦🇲",kw:["armenia","armenian","yerevan","nagorno","karabakh","artsakh"]},
  {name:"Australia",flag:"🇦🇺",kw:["australia","australian","canberra","sydney","melbourne","brisbane","perth","adelaide","queensland","new south wales"]},
  {name:"Austria",flag:"🇦🇹",kw:["austria","austrian","vienna","salzburg","innsbruck"]},
  {name:"Azerbaijan",flag:"🇦🇿",kw:["azerbaijan","azerbaijani","baku","nagorno-karabakh"]},
  {name:"Bahamas",flag:"🇧🇸",kw:["bahamas","nassau"]},
  {name:"Bahrain",flag:"🇧🇭",kw:["bahrain","bahraini","manama"]},
  {name:"Bangladesh",flag:"🇧🇩",kw:["bangladesh","bangladeshi","dhaka","chittagong","sylhet","hasina","yunus","rajshahi"]},
  {name:"Barbados",flag:"🇧🇧",kw:["barbados","bridgetown"]},
  {name:"Belarus",flag:"🇧🇾",kw:["belarus","belarusian","minsk","lukashenko"]},
  {name:"Belgium",flag:"🇧🇪",kw:["belgium","belgian","brussels","antwerp","ghent","flanders","wallonia"]},
  {name:"Belize",flag:"🇧🇿",kw:["belize","belmopan"]},
  {name:"Benin",flag:"🇧🇯",kw:["benin","beninese","porto-novo","cotonou"]},
  {name:"Bhutan",flag:"🇧🇹",kw:["bhutan","bhutanese","thimphu"]},
  {name:"Bolivia",flag:"🇧🇴",kw:["bolivia","bolivian","la paz","sucre","santa cruz de la sierra"]},
  {name:"Bosnia and Herzegovina",flag:"🇧🇦",kw:["bosnia","herzegovin","bosnian","sarajevo","republika srpska","banja luka"]},
  {name:"Botswana",flag:"🇧🇼",kw:["botswana","gaborone"]},
  {name:"Brazil",flag:"🇧🇷",kw:["brazil","brazilian","brasilia","rio de janeiro","sao paulo","são paulo","manaus","lula","bolsonaro","amazonia"]},
  {name:"Brunei",flag:"🇧🇳",kw:["brunei","bandar seri begawan"]},
  {name:"Bulgaria",flag:"🇧🇬",kw:["bulgaria","bulgarian","sofia","plovdiv"]},
  {name:"Burkina Faso",flag:"🇧🇫",kw:["burkina faso","burkinabe","ouagadougou","sahel junta"]},
  {name:"Burundi",flag:"🇧🇮",kw:["burundi","burundian","bujumbura","gitega"]},
  {name:"Cambodia",flag:"🇰🇭",kw:["cambodia","cambodian","phnom penh","khmer","hun sen","hun manet"]},
  {name:"Cameroon",flag:"🇨🇲",kw:["cameroon","cameroonian","yaoundé","yaounde","douala","anglophone crisis"]},
  {name:"Canada",flag:"🇨🇦",kw:["canada","canadian","ottawa","toronto","montreal","vancouver","calgary","quebec","alberta","ontario","trudeau","carney","rcmp"]},
  {name:"Cape Verde",flag:"🇨🇻",kw:["cape verde","cabo verde","praia"]},
  {name:"Central African Republic",flag:"🇨🇫",kw:["central african republic","bangui","car militia"]},
  {name:"Chad",flag:"🇹🇩",kw:["chad","chadian","ndjamena","n'djamena"]},
  {name:"Chile",flag:"🇨🇱",kw:["chile","chilean","santiago","valparaíso","valparaiso","atacama","boric"]},
  {name:"China",flag:"🇨🇳",kw:["china","chinese","beijing","shanghai","hong kong","shenzhen","guangzhou","chengdu","wuhan","tibet","xinjiang","xi jinping","ccp","prc","communist party of china","south china sea","belt and road","bri","taiwan strait","uyghur","dalai lama"]},
  {name:"Colombia",flag:"🇨🇴",kw:["colombia","colombian","bogotá","bogota","medellín","medellin","cali","cartagena","farc","petro"]},
  {name:"Comoros",flag:"🇰🇲",kw:["comoros","moroni"]},
  {name:"DR Congo",flag:"🇨🇩",kw:["kinshasa","goma","kivu","eastern drc","drc war","m23","kabila","democratic republic of congo"]},
  {name:"Republic of Congo",flag:"🇨🇬",kw:["brazzaville","sassou","pointe-noire","republic of congo"]},
  {name:"Costa Rica",flag:"🇨🇷",kw:["costa rica","san josé","san jose"]},
  {name:"Côte d'Ivoire",flag:"🇨🇮",kw:["ivory coast","côte d'ivoire","cote d'ivoire","ivorian","abidjan","yamoussoukro","ouattara"]},
  {name:"Croatia",flag:"🇭🇷",kw:["croatia","croatian","zagreb","dalmatia","split","dubrovnik"]},
  {name:"Cuba",flag:"🇨🇺",kw:["cuba","cuban","havana","fidel","castro","guantanamo"]},
  {name:"Cyprus",flag:"🇨🇾",kw:["cyprus","cypriot","nicosia","limassol"]},
  {name:"Czech Republic",flag:"🇨🇿",kw:["czech","czechia","czech republic","prague","brno"]},
  {name:"Denmark",flag:"🇩🇰",kw:["denmark","danish","copenhagen","greenland","faroe"]},
  {name:"Djibouti",flag:"🇩🇯",kw:["djibouti"]},
  {name:"Dominican Republic",flag:"🇩🇴",kw:["dominican republic","santo domingo"]},
  {name:"Ecuador",flag:"🇪🇨",kw:["ecuador","ecuadorian","quito","guayaquil","galapagos","noboa"]},
  {name:"Egypt",flag:"🇪🇬",kw:["egypt","egyptian","cairo","alexandria egypt","suez canal","sinai","nile","el-sisi","sisi","rafah crossing"]},
  {name:"El Salvador",flag:"🇸🇻",kw:["el salvador","salvadoran","san salvador","bukele"]},
  {name:"Equatorial Guinea",flag:"🇬🇶",kw:["equatorial guinea","malabo"]},
  {name:"Eritrea",flag:"🇪🇷",kw:["eritrea","eritrean","asmara"]},
  {name:"Estonia",flag:"🇪🇪",kw:["estonia","estonian","tallinn"]},
  {name:"Eswatini",flag:"🇸🇿",kw:["eswatini","swaziland","mbabane"]},
  {name:"Ethiopia",flag:"🇪🇹",kw:["ethiopia","ethiopian","addis ababa","tigray","amhara","oromia","abiy ahmed","tigray war"]},
  {name:"Fiji",flag:"🇫🇯",kw:["fiji","fijian","suva"]},
  {name:"Finland",flag:"🇫🇮",kw:["finland","finnish","helsinki","lapland"]},
  {name:"France",flag:"🇫🇷",kw:["france","french","paris","lyon","marseille","toulouse","nice","bordeaux","macron","élysée","elysee","normandy","alsace"]},
  {name:"Gabon",flag:"🇬🇦",kw:["gabon","gabonese","libreville","oligui"]},
  {name:"Gambia",flag:"🇬🇲",kw:["gambia","gambian","banjul"]},
  {name:"Georgia",flag:"🇬🇪",kw:["tbilisi","south ossetia","abkhazia","ivanishvili","georgian dream","saakashvili"]},
  {name:"Germany",flag:"🇩🇪",kw:["germany","german","berlin","munich","hamburg","frankfurt","cologne","stuttgart","bundeswehr","bundestag","scholz","merz","merkel","volkswagen","bmw","siemens","afd","spd","cdu"]},
  {name:"Ghana",flag:"🇬🇭",kw:["ghana","ghanaian","accra","kumasi","mahama","bawumia"]},
  {name:"Greece",flag:"🇬🇷",kw:["greece","greek","athens","thessaloniki","acropolis","aegean sea","crete","mitsotakis"]},
  {name:"Guatemala",flag:"🇬🇹",kw:["guatemala","guatemalan","guatemala city"]},
  {name:"Guinea",flag:"🇬🇳",kw:["guinea","guinean","conakry","mamadi"]},
  {name:"Guinea-Bissau",flag:"🇬🇼",kw:["guinea-bissau","bissau"]},
  {name:"Guyana",flag:"🇬🇾",kw:["guyana","guyanese","georgetown guyana","essequibo","ali guyana"]},
  {name:"Haiti",flag:"🇭🇹",kw:["haiti","haitian","port-au-prince","port au prince","haitian gang","haitian crisis"]},
  {name:"Honduras",flag:"🇭🇳",kw:["honduras","honduran","tegucigalpa","xiomara castro"]},
  {name:"Hungary",flag:"🇭🇺",kw:["hungary","hungarian","budapest","orban","fidesz"]},
  {name:"Iceland",flag:"🇮🇸",kw:["iceland","icelandic","reykjavik"]},
  {name:"India",flag:"🇮🇳",kw:["india","indian","new delhi","delhi","mumbai","bangalore","bengaluru","chennai","kolkata","calcutta","ahmedabad","pune","surat","jaipur","lucknow","nagpur","visakhapatnam","bhopal","patna","agra","varanasi","amritsar","chandigarh","coimbatore","indore","guwahati","bhubaneswar","thiruvananthapuram","kochi","srinagar","jammu","leh","ladakh","kashmir","west bengal","tamil nadu","modi","narendra modi","bjp","lok sabha","rajya sabha","bollywood","isro","india election","indian army","indian navy","india-china","india-pakistan","supreme court of india","ayodhya","ram mandir","hindutva","rupee"]},
  {name:"Indonesia",flag:"🇮🇩",kw:["indonesia","indonesian","jakarta","surabaya","bali","sumatra","java","kalimantan","bandung","prabowo","jokowi","widodo"]},
  {name:"Iran",flag:"🇮🇷",kw:["iran","iranian","tehran","isfahan","mashhad","khamenei","raisi","irgc","revolutionary guard","persian gulf","strait of hormuz","jcpoa","pezeshkian","iran nuclear","iran missile"]},
  {name:"Iraq",flag:"🇮🇶",kw:["iraq","iraqi","baghdad","basra","mosul","erbil","kirkuk","iraq war","iraqi parliament","iraqi militia"]},
  {name:"Ireland",flag:"🇮🇪",kw:["ireland","irish","dublin","cork","galway","taoiseach","dáil","dail","sinn féin","sinn fein","ireland election"]},
  {name:"Israel",flag:"🇮🇱",kw:["israel","israeli","jerusalem","tel aviv","haifa","netanyahu","idf","mossad","knesset","west bank","iron dome","israel-hamas","israel-iran","israel war","israel-hezbollah","october 7"]},
  {name:"Italy",flag:"🇮🇹",kw:["italy","italian","rome","milan","naples","turin","florence","venice","sicily","sardinia","meloni","vatican","pope"]},
  {name:"Jamaica",flag:"🇯🇲",kw:["jamaica","jamaican","kingston"]},
  {name:"Japan",flag:"🇯🇵",kw:["japan","japanese","tokyo","osaka","kyoto","hiroshima","nagasaki","yokohama","sapporo","fukushima","okinawa","kishida","ishiba","toyota","sony","honda","nintendo","nikkei","japan earthquake","japan election"]},
  {name:"Jordan",flag:"🇯🇴",kw:["jordan","jordanian","amman","petra","king abdullah"]},
  {name:"Kazakhstan",flag:"🇰🇿",kw:["kazakhstan","kazakhstani","astana","almaty","tokayev"]},
  {name:"Kenya",flag:"🇰🇪",kw:["kenya","kenyan","nairobi","mombasa","ruto","odinga","kenya election","kenya protest"]},
  {name:"Kuwait",flag:"🇰🇼",kw:["kuwait","kuwaiti","kuwait city"]},
  {name:"Kyrgyzstan",flag:"🇰🇬",kw:["kyrgyzstan","kyrgyz","bishkek"]},
  {name:"Laos",flag:"🇱🇦",kw:["laos","lao","vientiane"]},
  {name:"Latvia",flag:"🇱🇻",kw:["latvia","latvian","riga"]},
  {name:"Lebanon",flag:"🇱🇧",kw:["lebanon","lebanese","beirut","hezbollah","nasrallah","lebanon war","beirut explosion","lebanon crisis"]},
  {name:"Lesotho",flag:"🇱🇸",kw:["lesotho","maseru"]},
  {name:"Liberia",flag:"🇱🇷",kw:["liberia","liberian","monrovia","weah","boakai"]},
  {name:"Libya",flag:"🇱🇾",kw:["libya","libyan","tripoli libya","benghazi","tobruk","haftar"]},
  {name:"Lithuania",flag:"🇱🇹",kw:["lithuania","lithuanian","vilnius"]},
  {name:"Luxembourg",flag:"🇱🇺",kw:["luxembourg","luxembourgish"]},
  {name:"Madagascar",flag:"🇲🇬",kw:["madagascar","malagasy","antananarivo"]},
  {name:"Malawi",flag:"🇲🇼",kw:["malawi","malawian","lilongwe","blantyre","chakwera"]},
  {name:"Malaysia",flag:"🇲🇾",kw:["malaysia","malaysian","kuala lumpur","penang","johor","anwar ibrahim","mh370"]},
  {name:"Maldives",flag:"🇲🇻",kw:["maldives","maldivian","malé","male maldives","muizzu"]},
  {name:"Mali",flag:"🇲🇱",kw:["mali","malian","bamako","timbuktu","mali junta","goita"]},
  {name:"Malta",flag:"🇲🇹",kw:["malta","maltese","valletta"]},
  {name:"Mauritania",flag:"🇲🇷",kw:["mauritania","mauritanian","nouakchott"]},
  {name:"Mauritius",flag:"🇲🇺",kw:["mauritius","mauritian","port louis"]},
  {name:"Mexico",flag:"🇲🇽",kw:["mexico","mexican","mexico city","guadalajara","monterrey","tijuana","cancun","sinaloa cartel","pemex","amlo","obrador","sheinbaum","usmca","mexico border"]},
  {name:"Moldova",flag:"🇲🇩",kw:["moldova","moldovan","chisinau","transnistria","sandu"]},
  {name:"Mongolia",flag:"🇲🇳",kw:["mongolia","mongolian","ulaanbaatar"]},
  {name:"Montenegro",flag:"🇲🇪",kw:["montenegro","montenegrin","podgorica"]},
  {name:"Morocco",flag:"🇲🇦",kw:["morocco","moroccan","rabat","casablanca","marrakech","fez","agadir","western sahara"]},
  {name:"Mozambique",flag:"🇲🇿",kw:["mozambique","mozambican","maputo","cabo delgado","frelimo","mondlane"]},
  {name:"Myanmar",flag:"🇲🇲",kw:["myanmar","burmese","burma","naypyidaw","yangon","rangoon","rohingya","tatmadaw","aung san suu kyi","myanmar coup","myanmar military","kachin","karen"]},
  {name:"Namibia",flag:"🇳🇦",kw:["namibia","namibian","windhoek"]},
  {name:"Nepal",flag:"🇳🇵",kw:["nepal","nepali","nepalese","kathmandu","everest","oli nepal","deuba","prachanda"]},
  {name:"Netherlands",flag:"🇳🇱",kw:["netherlands","dutch","amsterdam","rotterdam","the hague","wilders","rutte","holland"]},
  {name:"New Zealand",flag:"🇳🇿",kw:["new zealand","wellington","auckland","christchurch","maori","all blacks","luxon"]},
  {name:"Nicaragua",flag:"🇳🇮",kw:["nicaragua","nicaraguan","managua","ortega"]},
  {name:"Niger",flag:"🇳🇪",kw:["niger","nigerien","niamey","niger junta"]},
  {name:"Nigeria",flag:"🇳🇬",kw:["nigeria","nigerian","lagos","abuja","kano","port harcourt","boko haram","tinubu","niger delta","biafra","enugu"]},
  {name:"North Korea",flag:"🇰🇵",kw:["north korea","north korean","pyongyang","kim jong-un","kim jong un","dprk","north korean missile","north korean nuclear"]},
  {name:"North Macedonia",flag:"🇲🇰",kw:["north macedonia","macedonian","skopje"]},
  {name:"Norway",flag:"🇳🇴",kw:["norway","norwegian","oslo","svalbard","equinor"]},
  {name:"Oman",flag:"🇴🇲",kw:["oman","omani","muscat"]},
  {name:"Pakistan",flag:"🇵🇰",kw:["pakistan","pakistani","islamabad","karachi","lahore","rawalpindi","peshawar","faisalabad","multan","quetta","imran khan","shehbaz","sharif pakistan","isi","pti","pml-n","balochistan","khyber","sindh","mirpur","gilgit","gilgit-baltistan","muzaffarabad","azad kashmir","ajk","pakistan army","pakistan election","pakistan flood","pakistan economy","pakistan-india"]},
  {name:"Palestine",flag:"🇵🇸",kw:["palestine","palestinian","gaza","west bank","ramallah","jenin","hebron","hamas","fatah","plo","intifada","rafah","khan younis","al-aqsa","gaza strip","gaza war","gaza ceasefire","october 7","sinwar","yahya"]},
  {name:"Panama",flag:"🇵🇦",kw:["panama","panamanian","panama city","panama canal","mulino"]},
  {name:"Papua New Guinea",flag:"🇵🇬",kw:["papua new guinea","png","port moresby","marape"]},
  {name:"Paraguay",flag:"🇵🇾",kw:["paraguay","paraguayan","asunción","asuncion"]},
  {name:"Peru",flag:"🇵🇪",kw:["peru","peruvian","lima peru","cusco","machu picchu","boluarte"]},
  {name:"Philippines",flag:"🇵🇭",kw:["philippines","filipino","philippine","manila","davao","duterte","marcos","ferdinand marcos"]},
  {name:"Poland",flag:"🇵🇱",kw:["poland","polish","warsaw","krakow","gdansk","tusk","duda","pis","solidarity"]},
  {name:"Portugal",flag:"🇵🇹",kw:["portugal","portuguese","lisbon","porto","madeira","azores","chega"]},
  {name:"Qatar",flag:"🇶🇦",kw:["qatar","qatari","doha","al thani","qatar mediation","qatar talks"]},
  {name:"Romania",flag:"🇷🇴",kw:["romania","romanian","bucharest","transylvania","georgescu","ciolacu"]},
  {name:"Russia",flag:"🇷🇺",kw:["russia","russian","moscow","kremlin","putin","saint petersburg","st. petersburg","chechnya","siberia","wagner","fsb","duma","russian military","russian army","russian navy","russian missile","russia ukraine","russia sanctions","russia election","navalny","volga"]},
  {name:"Rwanda",flag:"🇷🇼",kw:["rwanda","rwandan","kigali","kagame","genocide","m23 rwanda"]},
  {name:"Saudi Arabia",flag:"🇸🇦",kw:["saudi arabia","saudi","riyadh","jeddah","mecca","medina","mbs","mohammed bin salman","crown prince","aramco","neom","opec","vision 2030"]},
  {name:"Senegal",flag:"🇸🇳",kw:["senegal","senegalese","dakar","faye","sonko","ousmane senegal"]},
  {name:"Serbia",flag:"🇷🇸",kw:["serbia","serbian","belgrade","vucic","serbia protest","serbia election"]},
  {name:"Sierra Leone",flag:"🇸🇱",kw:["sierra leone","freetown"]},
  {name:"Singapore",flag:"🇸🇬",kw:["singapore","singaporean","lee hsien loong","lawrence wong","jurong","sentosa"]},
  {name:"Slovakia",flag:"🇸🇰",kw:["slovakia","slovak","bratislava","fico","robert fico"]},
  {name:"Slovenia",flag:"🇸🇮",kw:["slovenia","slovenian","ljubljana","golob"]},
  {name:"Solomon Islands",flag:"🇸🇧",kw:["solomon islands","honiara"]},
  {name:"Somalia",flag:"🇸🇴",kw:["somalia","somali","mogadishu","al-shabaab","shabaab","puntland","somaliland","hassan sheikh"]},
  {name:"South Africa",flag:"🇿🇦",kw:["south africa","south african","pretoria","cape town","johannesburg","durban","soweto","anc","ramaphosa","zuma","south africa election","loadshedding","eskom"]},
  {name:"South Korea",flag:"🇰🇷",kw:["south korea","south korean","seoul","busan","incheon","samsung","hyundai","lg","k-pop","kpop","korean peninsula","yoon suk-yeol","han duck-soo","korea election","korea martial law","korea impeach"]},
  {name:"South Sudan",flag:"🇸🇸",kw:["south sudan","juba","salva kiir","machar","south sudan war"]},
  {name:"Spain",flag:"🇪🇸",kw:["spain","spanish","madrid","barcelona","seville","bilbao","catalonia","basque","pedro sanchez","vox","real madrid","spain election","spain flood","valencia flood"]},
  {name:"Sri Lanka",flag:"🇱🇰",kw:["sri lanka","sri lankan","colombo","kandy","rajapaksa","wickremesinghe","dissanayake","ceylon","jaffna","sri lanka crisis","sri lanka economy"]},
  {name:"Sudan",flag:"🇸🇩",kw:["sudan","sudanese","khartoum","darfur","rsf","rapid support forces","al-burhan","hemedti","janjaweed","sudan war","sudan crisis","sudan famine"]},
  {name:"Sweden",flag:"🇸🇪",kw:["sweden","swedish","stockholm","gothenburg","malmo","saab","kristersson","nato sweden"]},
  {name:"Switzerland",flag:"🇨🇭",kw:["switzerland","swiss","bern","zurich","geneva","davos","basel","cern","swiss bank"]},
  {name:"Syria",flag:"🇸🇾",kw:["syria","syrian","damascus","aleppo","idlib","homs","raqqa","bashar","al-assad","hts","hayat tahrir","syrian rebel","syrian war","jolani"]},
  {name:"Taiwan",flag:"🇹🇼",kw:["taiwan","taiwanese","taipei","tsai","lai ching-te","william lai","formosa","tsmc","foxconn","taiwan strait","taiwan-china","taiwan independence","taiwan election"]},
  {name:"Tajikistan",flag:"🇹🇯",kw:["tajikistan","tajik","dushanbe"]},
  {name:"Tanzania",flag:"🇹🇿",kw:["tanzania","tanzanian","dar es salaam","zanzibar","kilimanjaro","hassan samia"]},
  {name:"Thailand",flag:"🇹🇭",kw:["thailand","thai","bangkok","chiang mai","phuket","pattaya","paetongtarn","thailand election","thailand protest"]},
  {name:"Timor-Leste",flag:"🇹🇱",kw:["timor-leste","east timor","timorese","dili"]},
  {name:"Togo",flag:"🇹🇬",kw:["togo","togolese","lomé","lome"]},
  {name:"Trinidad and Tobago",flag:"🇹🇹",kw:["trinidad","tobago","port of spain"]},
  {name:"Tunisia",flag:"🇹🇳",kw:["tunisia","tunisian","tunis","saied","carthage"]},
  {name:"Turkey",flag:"🇹🇷",kw:["turkey","turkish","turkiye","türkiye","ankara","istanbul","erdogan","bosphorus","anatolia"]},
  {name:"Turkmenistan",flag:"🇹🇲",kw:["turkmenistan","turkmen","ashgabat"]},
  {name:"Uganda",flag:"🇺🇬",kw:["uganda","ugandan","kampala","museveni"]},
  {name:"Ukraine",flag:"🇺🇦",kw:["ukraine","ukrainian","kyiv","kiev","kharkiv","mariupol","donbas","donbass","zaporizhzhia","odesa","odessa","lviv","zelensky","zelenskyy","azov","bucha","kherson","crimea","ukraine war","ukraine russia","ukraine nato","ukraine aid","ukraine ceasefire","ukraine drone","ukraine front"]},
  {name:"United Arab Emirates",flag:"🇦🇪",kw:["united arab emirates","uae","dubai","abu dhabi","sharjah","emirates airline","expo dubai"]},
  {name:"United Kingdom",flag:"🇬🇧",kw:["united kingdom","britain","british","england","english","scotland","scottish","wales","welsh","northern ireland","london","manchester","birmingham","leeds","glasgow","liverpool","edinburgh","bristol","sheffield","parliament uk","downing street","buckingham","westminster","sunak","starmer","labour party","conservative","nhs","brexit","uk election","king charles"]},
  {name:"United States",flag:"🇺🇸",kw:["united states","american","america","washington","new york","los angeles","chicago","houston","dallas","miami","san francisco","boston","philadelphia","phoenix","seattle","denver","atlanta usa","las vegas","pentagon","white house","congress usa","us senate","democrat","republican","trump","biden","harris","nasa","silicon valley","wall street","federal reserve","supreme court","fbi","cia","state department","california","texas","florida","ohio","michigan","arizona","nevada","wisconsin","pennsylvania","illinois","tariff","us election","us economy","us military","us troops"]},
  {name:"Uruguay",flag:"🇺🇾",kw:["uruguay","uruguayan","montevideo","orsi"]},
  {name:"Uzbekistan",flag:"🇺🇿",kw:["uzbekistan","uzbek","tashkent","samarkand","mirziyoyev"]},
  {name:"Venezuela",flag:"🇻🇪",kw:["venezuela","venezuelan","caracas","maduro","guaidó","guaido","orinoco","venezuela election","venezuela crisis","venezuela opposition","edmundo"]},
  {name:"Vietnam",flag:"🇻🇳",kw:["vietnam","vietnamese","hanoi","ho chi minh city","saigon","mekong","to lam"]},
  {name:"Yemen",flag:"🇾🇪",kw:["yemen","yemeni","sanaa","sana'a","aden","houthi","houthis","ansarallah","red sea attack","houthi attack","yemen war","bab el-mandeb"]},
  {name:"Zambia",flag:"🇿🇲",kw:["zambia","zambian","lusaka","hichilema"]},
  {name:"Zimbabwe",flag:"🇿🇼",kw:["zimbabwe","zimbabwean","harare","mnangagwa","mugabe"]}
];

// Ambiguous keyword resolution (India POV)
const AMBIGUOUS_CASES = [
  {
    kw: "punjab",
    resolve(norm) {
      const pak = [" lahore "," faisalabad "," multan "," rawalpindi "," peshawar "," pakistan "," pakistani "," imran khan "," pti "," quetta "," sindh "];
      if (pak.some(h => norm.includes(h))) return [{c:"Pakistan",certain:true}];
      return [{c:"India",certain:true}];
    }
  },
  {
    kw: "hyderabad",
    resolve(norm) {
      const pak = [" sindh "," pakistan "," pakistani "," karachi "," sukkur "," larkana "];
      if (pak.some(h => norm.includes(h))) return [{c:"Pakistan",certain:true}];
      return [{c:"India",certain:true}];
    }
  },
  {
    kw: "bengal",
    resolve(norm) {
      if (norm.includes(" west bengal ") || norm.includes(" kolkata ")) return [{c:"India",certain:true}];
      const bd = [" dhaka "," bangladesh "," bangladeshi "," chittagong "," hasina "," yunus "," sylhet "," rajshahi "];
      if (bd.some(h => norm.includes(h))) return [{c:"Bangladesh",certain:true}];
      return [{c:"India",certain:true}];
    }
  },
  {
    kw: "bengali",
    resolve(norm) {
      const bd = [" dhaka "," bangladesh "," bangladeshi "," chittagong "," hasina "," yunus "];
      if (bd.some(h => norm.includes(h))) return [{c:"Bangladesh",certain:true}];
      return [{c:"India",certain:true}];
    }
  },
  {
    kw: "tamil",
    resolve(norm) {
      if (norm.includes(" tamil nadu ")) return [{c:"India",certain:true}];
      const lanka = [" sri lanka "," sri lankan "," colombo "," kandy "," rajapaksa "," lanka "," ceylon "," jaffna "];
      if (lanka.some(h => norm.includes(h))) return [{c:"Sri Lanka",certain:true}];
      return [{c:"India",certain:true}];
    }
  },
  {
    kw: "georgia",
    resolve(norm) {
      const caucasus = [" tbilisi "," south ossetia "," abkhazia "," ivanishvili "," georgian dream "," saakashvili "];
      const usa = [" atlanta "," united states "," american "," us senate "," republican "," democrat "," trump "," biden "," georgia election "," georgia senate "];
      const hasCaucasus = caucasus.some(h => norm.includes(h));
      const hasUSA = usa.some(h => norm.includes(h));
      if (hasCaucasus && !hasUSA) return [{c:"Georgia",certain:true}];
      if (hasUSA && !hasCaucasus) return [{c:"United States",certain:true}];
      if (hasCaucasus && hasUSA) return [{c:"Georgia",certain:true},{c:"United States",certain:true}];
      return [{c:"United States",certain:true}];
    }
  },
  {
    kw: "congo",
    resolve(norm, views) {
      const drc = [" kinshasa "," goma "," kivu "," eastern congo "," drc "," democratic republic "," m23 "," kabila "];
      const roc = [" brazzaville "," sassou "," pointe-noire "," republic of congo "];
      const hasDRC = drc.some(h => norm.includes(h));
      const hasROC = roc.some(h => norm.includes(h));
      if (hasDRC && !hasROC) return [{c:"DR Congo",certain:true}];
      if (hasROC && !hasDRC) return [{c:"Republic of Congo",certain:true}];
      if (hasDRC && hasROC) return [{c:"DR Congo",certain:true},{c:"Republic of Congo",certain:true}];
      if (views >= 30000) return [{c:"DR Congo",certain:false},{c:"Republic of Congo",certain:false}];
      return null;
    }
  }
];

// World regions
const REGIONS_DEF = [
  { name:"South Asia",     icon:"🌏", countries:["India","Pakistan","Bangladesh","Sri Lanka","Nepal","Bhutan","Maldives","Afghanistan"] },
  { name:"Southeast Asia", icon:"🌏", countries:["Indonesia","Malaysia","Thailand","Vietnam","Philippines","Singapore","Myanmar","Cambodia","Laos","Brunei","Timor-Leste"] },
  { name:"East Asia",      icon:"🌏", countries:["China","Japan","South Korea","North Korea","Taiwan","Mongolia"] },
  { name:"Central Asia",   icon:"🌐", countries:["Kazakhstan","Uzbekistan","Kyrgyzstan","Tajikistan","Turkmenistan","Azerbaijan"] },
  { name:"Middle East",    icon:"🕌", countries:["Saudi Arabia","United Arab Emirates","Iran","Iraq","Israel","Palestine","Jordan","Lebanon","Syria","Yemen","Oman","Kuwait","Qatar","Bahrain","Turkey"] },
  { name:"Europe",         icon:"🏛️", countries:["United Kingdom","France","Germany","Italy","Spain","Netherlands","Poland","Sweden","Norway","Denmark","Finland","Belgium","Austria","Switzerland","Portugal","Czech Republic","Hungary","Romania","Greece","Ireland","Serbia","Croatia","Ukraine","Russia","Belarus","Moldova","Georgia","North Macedonia","Slovenia","Slovakia","Montenegro","Albania","Bosnia and Herzegovina","Estonia","Latvia","Lithuania","Luxembourg","Malta","Iceland","Cyprus"] },
  { name:"Africa",         icon:"🌍", countries:["Nigeria","Kenya","South Africa","Egypt","Ethiopia","Sudan","Somalia","Tanzania","Ghana","Morocco","Libya","Algeria","DR Congo","Republic of Congo","Rwanda","Uganda","Cameroon","Zimbabwe","Mozambique","Zambia","Malawi","Angola","Senegal","Burkina Faso","Mali","Niger","Chad","Guinea","Sierra Leone","Liberia","Gambia","Benin","Togo","Gabon","Equatorial Guinea","Burundi","Central African Republic","Eritrea","Djibouti","Cape Verde","Lesotho","Eswatini","Botswana","Namibia","South Sudan","Mauritius","Madagascar"] },
  { name:"North America",  icon:"🌎", countries:["United States","Canada","Mexico"] },
  { name:"Latin America",  icon:"🌎", countries:["Brazil","Argentina","Colombia","Venezuela","Peru","Chile","Bolivia","Ecuador","Paraguay","Uruguay","Guyana","Cuba","Haiti","Dominican Republic","Jamaica","Trinidad and Tobago","Panama","Costa Rica","El Salvador","Honduras","Guatemala","Nicaragua","Barbados","Antigua and Barbuda","Grenada","Saint Lucia","Saint Vincent"] },
  { name:"Oceania",        icon:"🌊", countries:["Australia","New Zealand","Fiji","Papua New Guinea","Solomon Islands","Samoa","Tonga","Vanuatu"] }
];
