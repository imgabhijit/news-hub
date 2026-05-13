// Indian states/UTs and regions data

const STATE_REGION_COLORS = {
  north:   '#3a7bd5', south: '#27ae60', east: '#e67e22',
  west:    '#8e44ad', ne:    '#16a085', central: '#c0392b'
};

const STATES_RAW = [
  {name:"Andhra Pradesh",    code:"AP", region:"south",   kw:["andhra pradesh","andhra","vizag","visakhapatnam","amaravati","vijayawada","guntur","tirupati","jagan mohan reddy","chandrababu naidu","tdp","ysrcp","ap election"]},
  {name:"Arunachal Pradesh", code:"AR", region:"ne",      kw:["arunachal pradesh","arunachal","itanagar","pema khandu"]},
  {name:"Assam",             code:"AS", region:"ne",      kw:["assam","assamese","guwahati","dispur","jorhat","silchar","dibrugarh","himanta","himanta biswa sarma","nrc assam","bodo","assam election","assam flood"]},
  {name:"Bihar",             code:"BR", region:"east",    kw:["bihar","bihari","patna","gaya","muzaffarpur","bhagalpur","nitish kumar","tejashwi","rjd","jdu","bihar election","bihar flood"]},
  {name:"Chhattisgarh",      code:"CG", region:"central", kw:["chhattisgarh","raipur","bhilai","bilaspur","vishnu deo sai","chhattisgarh election","naxal chhattisgarh","maoist chhattisgarh"]},
  {name:"Goa",               code:"GA", region:"west",    kw:["goa","goan","panaji","pramod sawant","goa election"]},
  {name:"Gujarat",           code:"GJ", region:"west",    kw:["gujarat","gujarati","ahmedabad","surat","vadodara","rajkot","gandhinagar","bhupendra patel","gujarat election","morbi","kutch","saurashtra"]},
  {name:"Haryana",           code:"HR", region:"north",   kw:["haryana","haryanvi","gurugram","gurgaon","faridabad","ambala","rohtak","panipat","nayab singh saini","manohar lal","haryana election","jat haryana"]},
  {name:"Himachal Pradesh",  code:"HP", region:"north",   kw:["himachal pradesh","himachal","shimla","dharamshala","dharamsala","manali","sukhvinder sukhu","himachal election","spiti","kinnaur"]},
  {name:"Jharkhand",         code:"JH", region:"east",    kw:["jharkhand","ranchi","jamshedpur","dhanbad","bokaro","hemant soren","jharkhand election","jharkhand tribal"]},
  {name:"Karnataka",         code:"KA", region:"south",   kw:["karnataka","karnatakan","bengaluru","bangalore","mysuru","mysore","mangaluru","mangalore","hubballi","siddaramaiah","dk shivakumar","jds","karnataka election","kaveri","bellary"]},
  {name:"Kerala",            code:"KL", region:"south",   kw:["kerala","keralite","thiruvananthapuram","trivandrum","kochi","kozhikode","calicut","thrissur","kannur","pinarayi vijayan","cpim kerala","udf","ldf","kerala flood","kerala election","kerala landslide","wayanad"]},
  {name:"Madhya Pradesh",    code:"MP", region:"central", kw:["madhya pradesh","bhopal","indore","jabalpur","gwalior","ujjain","mohan yadav","shivraj","mp election","madhya pradesh election","narmada","chambal"]},
  {name:"Maharashtra",       code:"MH", region:"west",    kw:["maharashtra","mumbai","pune","nagpur","nashik","aurangabad","sambhajinagar","thane","eknath shinde","devendra fadnavis","uddhav thackeray","shiv sena","ncp","maharashtra election","maha vikas aghadi","maratha","konkan","vidarbha"]},
  {name:"Manipur",           code:"MN", region:"ne",      kw:["manipur","imphal","n biren singh","manipur violence","kuki","meitei","manipur conflict","manipur unrest","manipur protest"]},
  {name:"Meghalaya",         code:"ML", region:"ne",      kw:["meghalaya","shillong","konrad sangma","npp meghalaya","cherrapunji"]},
  {name:"Mizoram",           code:"MZ", region:"ne",      kw:["mizoram","aizawl","lalduhoma","zpm mizoram"]},
  {name:"Nagaland",          code:"NL", region:"ne",      kw:["nagaland","kohima","neiphiu rio","naga","nagaland election","dimapur"]},
  {name:"Odisha",            code:"OD", region:"east",    kw:["odisha","odia","bhubaneswar","cuttack","puri district","puri city","puri odisha","rourkela","mohan majhi","naveen patnaik","bjd","odisha election","jagannath","rath yatra","odisha cyclone","odisha flood","konark","sambalpur"]},
  {name:"Punjab",            code:"PB", region:"north",   kw:["punjab","amritsar","ludhiana","jalandhar","patiala","bhagwant mann","aap punjab","akali dal","punjab election","punjab drug","farmer punjab","mohali","bathinda"]},
  {name:"Rajasthan",         code:"RJ", region:"north",   kw:["rajasthan","jaipur","jodhpur","udaipur","kota","ajmer","jaisalmer","bikaner","bhajanlal sharma","ashok gehlot","rajasthan election","alwar","sikar"]},
  {name:"Sikkim",            code:"SK", region:"ne",      kw:["sikkim","gangtok","prem singh tamang","golay","sikkim flood","sikkim disaster","teesta"]},
  {name:"Tamil Nadu",        code:"TN", region:"south",   kw:["tamil nadu","chennai","coimbatore","madurai","trichy","tiruchirappalli","salem","tirunelveli","mk stalin","aiadmk","dmk","tn election","cauvery","jallikattu","kollywood","kanyakumari"]},
  {name:"Telangana",         code:"TS", region:"south",   kw:["telangana","hyderabad","revanth reddy","brs","trs","kcr","chandrashekar rao","telangana election","warangal","karimnagar","nizamabad","secunderabad","hussain sagar"]},
  {name:"Tripura",           code:"TR", region:"ne",      kw:["tripura","agartala","manik saha","tripura election","gomati"]},
  {name:"Uttarakhand",       code:"UK", region:"north",   kw:["uttarakhand","dehradun","haridwar","rishikesh","mussoorie","kedarnath","badrinath","pushkar dhami","uttarakhand election","char dham","uttarakhand disaster","uttarakhand tunnel","nainital","roorkee"]},
  {name:"Uttar Pradesh",     code:"UP", region:"north",   kw:["uttar pradesh","lucknow","agra","varanasi","prayagraj","kanpur","meerut","ghaziabad","noida","allahabad","mathura","yogi adityanath","akhilesh yadav","samajwadi","up election","ayodhya","ram mandir","gorakhpur","bareilly","moradabad","aligarh"]},
  {name:"West Bengal",       code:"WB", region:"east",    kw:["west bengal","kolkata","calcutta","howrah","siliguri","durgapur","asansol","darjeeling","mamata banerjee","tmc","trinamool","bengal election","bengal violence","sandeshkhali","wb election","murshidabad","malda"]},
  {name:"Delhi",             code:"DL", region:"north",   kw:["delhi","new delhi","aam aadmi party","aap delhi","kejriwal","arvind kejriwal","atishi","rekha gupta","delhi election","delhi metro","delhi pollution","delhi mcd","ncr","dwarka","rohini","connaught place"]},
  {name:"Jammu & Kashmir",   code:"JK", region:"north",   kw:["jammu","srinagar","kashmir","omar abdullah","j&k","jk election","kashmir valley","article 370","pahalgam","pulwama","uri","baramulla","sopore","kathua","rajouri","poonch","anantnag"]},
  {name:"Ladakh",            code:"LA", region:"north",   kw:["ladakh","leh","kargil","siachen","galwan","ladakh election","zanskar","nubra"]},
  {name:"Chandigarh",        code:"CH", region:"north",   kw:["chandigarh mayor","chandigarh ut","chandigarh administration","chandigarh municipal"]},
  {name:"Puducherry",        code:"PY", region:"south",   kw:["puducherry","pondicherry","n rangasamy","puducherry election","mahe"]},
  {name:"Andaman & Nicobar", code:"AN", region:"south",   kw:["andaman","nicobar","port blair","andaman nicobar"]},
  {name:"Lakshadweep",       code:"LD", region:"south",   kw:["lakshadweep","kavaratti","lakshadweep island","agatti"]},
  {name:"Dadra & NH",        code:"DN", region:"west",    kw:["dadra","nagar haveli","daman","diu","silvassa"]}
];

const INDIA_REGIONS = [
  { name:"North India",   icon:"❄️",  color:"north",   states:["Jammu & Kashmir","Ladakh","Himachal Pradesh","Punjab","Haryana","Uttarakhand","Uttar Pradesh","Delhi","Chandigarh","Rajasthan"] },
  { name:"South India",   icon:"🌴",  color:"south",   states:["Tamil Nadu","Kerala","Karnataka","Andhra Pradesh","Telangana","Puducherry","Lakshadweep","Andaman & Nicobar"] },
  { name:"East India",    icon:"🌅",  color:"east",    states:["West Bengal","Bihar","Jharkhand","Odisha"] },
  { name:"West India",    icon:"🌊",  color:"west",    states:["Maharashtra","Gujarat","Goa","Dadra & NH"] },
  { name:"North East",    icon:"🌿",  color:"ne",      states:["Assam","Meghalaya","Manipur","Mizoram","Nagaland","Arunachal Pradesh","Tripura","Sikkim"] },
  { name:"Central India", icon:"🏞️", color:"central", states:["Madhya Pradesh","Chhattisgarh"] }
];
