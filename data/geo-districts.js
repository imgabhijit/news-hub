// West Bengal districts and regions data

const DIST_REGION_COLORS = {
  uttarbanga:  '#1565C0',
  gourbanga:   '#6D4C41',
  rarhbanga:   '#B71C1C',
  jangalmahal: '#1B5E20',
  banga:       '#4A148C'
};

const DISTRICTS_RAW = [
  // Uttar Banga
  {name:"Darjeeling",        code:"DJL", region:"uttarbanga",  kw:["darjeeling","দার্জিলিং","siliguri","শিলিগুড়ি","gorkha","gorkhland","gta","kurseong","কার্সিয়াং","mirik","বিমল গুরুং","bimal gurung","anit thapa"]},
  {name:"Kalimpong",         code:"KLP", region:"uttarbanga",  kw:["kalimpong","কালিম্পং"]},
  {name:"Jalpaiguri",        code:"JPG", region:"uttarbanga",  kw:["jalpaiguri","জলপাইগুড়ি","malbazar","ময়নাগুড়ি","dhupguri","ধুপগুড়ি","নাগরাকাটা"]},
  {name:"Alipurduar",        code:"ALD", region:"uttarbanga",  kw:["alipurduar","আলিপুরদুয়ার","falakata","মাদারিহাট","madarihat","কুমারগ্রাম"]},
  {name:"Cooch Behar",       code:"CCB", region:"uttarbanga",  kw:["cooch behar","কোচবিহার","dinhata","দিনহাটা","tufanganj","তুফানগঞ্জ","mathabhanga","মাথাভাঙ্গা"]},
  // Gour Banga
  {name:"Uttar Dinajpur",    code:"UDN", region:"gourbanga",   kw:["uttar dinajpur","উত্তর দিনাজপুর","north dinajpur","raiganj","রায়গঞ্জ","islampur","ইসলামপুর","goalpokhar","গোয়ালপোখর"]},
  {name:"Dakshin Dinajpur",  code:"DDN", region:"gourbanga",   kw:["dakshin dinajpur","দক্ষিণ দিনাজপুর","south dinajpur","balurghat","বালুরঘাট","gangarampur","গঙ্গারামপুর"]},
  {name:"Malda",             code:"MLD", region:"gourbanga",   kw:["malda","মালদা","english bazar","ইংরেজবাজার","গাজোল","chanchal","চাঁচল"]},
  {name:"Murshidabad",       code:"MBD", region:"gourbanga",   kw:["murshidabad","মুর্শিদাবাদ","berhampore","বহরমপুর","jiaganj","জিয়াগঞ্জ","domkol","ডোমকল","lalbagh","লালবাগ","sagardighi","সাগরদিঘি","jangipur","জঙ্গিপুর","raghunathganj"]},
  // Rarh Banga
  {name:"Birbhum",           code:"BRB", region:"rarhbanga",   kw:["birbhum","বীরভূম","suri","শান্তিনিকেতন","santiniketan","shantiniketan","bolpur","বোলপুর","rampurhat","রামপুরহাট","nalhati","দুবরাজপুর","ilambazar","ইলামবাজার"]},
  {name:"Paschim Bardhaman", code:"PWB", region:"rarhbanga",   kw:["paschim bardhaman","পশ্চিম বর্ধমান","asansol","আসানসোল","durgapur","দুর্গাপুর","raniganj","রানিগঞ্জ","andal","আন্দাল","kulti","কুলটি","jamuria"]},
  {name:"Purba Bardhaman",   code:"PEB", region:"rarhbanga",   kw:["purba bardhaman","পূর্ব বর্ধমান","bardhaman","বর্ধমান","burdwan","কালনা","kalna","katwa","কাটোয়া","memari","মেমারি","galsi"]},
  {name:"Bankura",           code:"BNK", region:"rarhbanga",   kw:["bankura","বাঁকুড়া","bishnupur","বিষ্ণুপুর","khatra","সোনামুখী","sonamukhi","onda","শালতোড়া"]},
  // Jangal Mahal
  {name:"Purulia",           code:"PRL", region:"jangalmahal", kw:["purulia","পুরুলিয়া","manbhum","মানভূম","raghunathpur","রঘুনাথপুর","jhalda","ঝালদা"]},
  {name:"Jhargram",          code:"JGM", region:"jangalmahal", kw:["jhargram","ঝাড়গ্রাম","belpahari","বেলপাহাড়ি","nayagram","গড়বেতা"]},
  {name:"Paschim Medinipur", code:"PWM", region:"jangalmahal", kw:["paschim medinipur","পশ্চিম মেদিনীপুর","west midnapore","midnapore","মেদিনীপুর","kharagpur","খড়্গপুর","ghatal","ঘাটাল","debra","কেশিয়াড়ি","salboni","শালবনি","pingla"]},
  // Dakshin Banga
  {name:"Kolkata",           code:"KOL", region:"banga",       kw:["kolkata","কলকাতা","calcutta","লালবাজার","lalbazar","kolkata metro","কলকাতা মেট্রো","salt lake","সল্ট লেক","park street","পার্ক স্ট্রিট","south kolkata","north kolkata"]},
  {name:"Howrah",            code:"HWH", region:"banga",       kw:["howrah","হাওড়া","uluberia","উলুবেড়িয়া","bagnan","আমতা","amta","উদয়নারায়ণপুর","howrah station","হাওড়া স্টেশন"]},
  {name:"Hooghly",           code:"HGL", region:"banga",       kw:["hooghly","হুগলি","chinsurah","চুঁচুড়া","chandannagar","চন্দননগর","serampore","শ্রীরামপুর","arambagh","আরামবাগ","tarakeswar","তারকেশ্বর","singur","সিঙ্গুর","goghat"]},
  {name:"North 24 Parganas", code:"N24", region:"banga",       kw:["north 24 parganas","উত্তর ২৪ পরগনা","barasat","বারাসাত","basirhat","বসিরহাট","barrackpore","ব্যারাকপুর","sandeshkhali","সন্দেশখালি","bongaon","বনগাঁ","habra","হাবড়া","naihati","নৈহাটি","titagarh","gaighata","গাইঘাটা","deganga","দেগঙ্গা"]},
  {name:"South 24 Parganas", code:"S24", region:"banga",       kw:["south 24 parganas","দক্ষিণ ২৪ পরগনা","diamond harbour","ডায়মন্ড হারবার","sundarban","সুন্দরবন","kakdwip","কাকদ্বীপ","canning","ক্যানিং","mathurapur","মথুরাপুর","bhangar","ভাঙড়","sonarpur","সোনারপুর","budge budge"]},
  {name:"Nadia",             code:"NDI", region:"banga",       kw:["nadia","নদিয়া","krishnanagar","কৃষ্ণনগর","kalyani","কল্যাণী","ranaghat","রানাঘাট","nabadwip","নবদ্বীপ","shantipur","শান্তিপুর","chakdaha","চাকদহ"]},
  {name:"Purba Medinipur",   code:"PEM", region:"banga",       kw:["purba medinipur","পূর্ব মেদিনীপুর","east midnapore","digha","দিঘা","haldia","হলদিয়া","tamluk","তমলুক","kanthi","কাঁথি","contai","এগরা","egra","পটাশপুর"]}
];

const BENGAL_REGIONS = [
  { name:"Uttar Banga",   bn:"উত্তরবঙ্গ", icon:"🏔️", color:"uttarbanga",  districts:["Darjeeling","Kalimpong","Jalpaiguri","Alipurduar","Cooch Behar"] },
  { name:"Gour Banga",    bn:"গৌড়বঙ্গ",   icon:"🏛️", color:"gourbanga",   districts:["Malda","Uttar Dinajpur","Dakshin Dinajpur","Murshidabad"] },
  { name:"Rarh Banga",    bn:"রাঢ়বঙ্গ",   icon:"🏜️", color:"rarhbanga",   districts:["Birbhum","Paschim Bardhaman","Purba Bardhaman","Bankura"] },
  { name:"Jangal Mahal",  bn:"জঙ্গলমহল", icon:"🌲", color:"jangalmahal", districts:["Purulia","Jhargram","Paschim Medinipur"] },
  { name:"Dakshin Banga", bn:"দক্ষিণবঙ্গ", icon:"🌊", color:"banga",       districts:["Kolkata","Howrah","Hooghly","North 24 Parganas","South 24 Parganas","Nadia","Purba Medinipur"] }
];
