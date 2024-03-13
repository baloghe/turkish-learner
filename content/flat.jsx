const useState = React.useState;

const date2string = dd => {
	const y = dd.getFullYear();
  const m = dd.getMonth()+1;
  const d = dd.getDate();
  
  return [y,
  	m < 10 ? '0'+m : m,
    d < 10 ? '0'+d : d
    ].join("-")
    ;
};

function MeterReadings({readings, actFlat, flats, flatChanged, changeReading, valueBeingChanged}){
	
  const [state, setState] = useState("show");
  const [actMeter, setActMeter] = useState();
  
  //readings: [...{meter: "", last: num, unit: "", date: date}]
  console.log(`MeterReadings :: ${readings.map((e,i)=>i+":"+e.meter)}`);
  
  const readingChanged = (e) => {
  	console.log(`MeterReadings.readingChanged :: ${e}`);
    valueBeingChanged(true);
    setState("change");
    setActMeter(e);
  };
  
  const readingChangeSubmitted = (inFlatKey, inMeter, newData) => {
  	console.log(`MeterReadings.readingChangeSubmitted :: [${newData.date}, ${newData.last}]`);
    setState("show");
    setActMeter(null);
    changeReading(inFlatKey, inMeter, newData);
  };
  
  const readingChangeCancelled = () => {
  	console.log(`MeterReadings.readingChangeCancelled`);
    setState("show");
    setActMeter(null);
    valueBeingChanged(false);
  };
  
  const getReadingsPane = () => {
  	return (
  <div>
  <h3>Meter Readings</h3>
    <table id="meters" key="meters">
      <thead>
        <tr>
          <th key="msh1"></th>
          <th key="msh2">Last</th>
          <th key="msh3"></th>
          <th key="msh4">Date</th>
          <th key="msh5"></th>
        </tr>
      </thead>
      <tbody>
      {readings.map((e,i) => (
      	<tr key={"msr"+i}>
          <td key={"ms"+i+"-1"}>{e.meter}</td>
          <td key={"ms"+i+"-2"}>{e.last}</td>
          <td key={"ms"+i+"-3"}>{e.unit}</td>
          <td key={"ms"+i+"-4"}>{e.date}</td>
            <td key={"ms"+i+"-5"}>
              <button className="ChangeBtn" onClick={()=>readingChanged(e.meter)} data-meter={e.meter}>
                <span>Change</span>
              </button>
            </td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>
  );
  };
  
  const getChangePane = (meter) => {
  	return (
    <ChangeMeterReading 
      actFlat={actFlat}
      actMeter={meter}
      actData={readings.filter(e=>e.meter==meter)[0]}
      changeReading={readingChangeSubmitted}
      cancel={readingChangeCancelled}
      />);
  };
  
  return (
  	state=="show" ? getReadingsPane() : getChangePane(actMeter)
  );
}

function ServiceInfo({serviceData}){

	const [visible, setVisible] = useState(false);
  
  const getContractual = () => {
  	if(   (!serviceData.contractual)
       || Object.keys(serviceData.contractual).length === 0
      ) return null;
    //otherwise...
    return (
    <table id="contractual" key="contractual">
      <tbody>
      {Object.keys(serviceData.contractual).map((k,i) => {
      	<tr key={"cont-"+i}>
          <td key={i+"-1"}>{k}</td>
          <td key={i+"-2"}>{serviceData.contractual[k]}</td>
        </tr>
      })}
      </tbody>
    </table>
    );
	};
    
    const getElectronic = () => {
  	if(   (!serviceData.electronic)
       || Object.keys(serviceData.electronic).length === 0
      ) return null;
    //otherwise...
    return (
      <div>
    	<a href={serviceData.electronic.url} target="_blank">{serviceData.electronic.url}</a>
      <p key="u"><b>User: </b> {serviceData.electronic.user}</p>
      <p key="p"><b>Pw: </b> {serviceData.electronic.pw}</p>
      </div>
    );
    };
  
  
  const changeVisibility = () => {
  	let prv=visible;
    setVisible(!prv);
  };
  
  const allTogether = () => {
  	return (
    <div className="srvInfo">
      <p>Readable meter: {serviceData.readable ? "YES" : "NO"}</p>
      {getContractual()}
      {getElectronic()}
      {serviceData.comment}
      </div>
    );
  };
  
  return (
  	<div>
      <button className="visBtn" onClick={changeVisibility}>
        <span>{serviceData.provider}</span>
      </button>
      {visible ? allTogether() : null}
    </div>
  );
  
}

function Services({services, payments, actFlat, flats, flatChanged, changePayment, valueBeingChanged}){
	
  const [state, setState] = useState("show");
  const [actService, setActService] = useState();

	//payments: [...{meter: "", amount: num, ccy: "", date: date}]
  console.log(`payments :: ${payments.map((e,i)=>i+":"+e.service)}`);
  
  const getServPayView = () => {
  	//get last payment for each provider when exists
    if(services==null) return null;
    let ret = JSON.parse(JSON.stringify(services));
    ret.forEach(e=>{
    	let lp = payments.filter(f=>f.service==e.service);
      if(lp.length > 0){
      	e["lastPayment"] = lp[0];
      }
    });
    return ret;
  };
  
  const changePaymentStarted = (e) => {
  	console.log(`changePaymentStarted :: ${e}`);
    valueBeingChanged(true);
    setState("change");
    setActService(e);
  };
  
  const paymentChangeSubmitted = (inFlatKey, inService, newData) => {
  	console.log(`Providers.paymentChangeSubmitted :: [${newData.date}, ${newData.last}]`);
    setState("show");
    setActService(null);
    changePayment(inFlatKey, inService, newData);
  };
  
  const paymentChangeCancelled = () => {
  	console.log(`Providers.paymentChangeCancelled`);
    setState("show");
    setActService(null);
    valueBeingChanged(false);
  };
  
  const getPaymentsPane = () => {
  let sp = getServPayView();
  return (
  <div>
  <h3>Providers and payments</h3>
    <table id="payments" key="payments">
      <thead>
        <tr>
          <th key="psh1"></th>
          <th key="psh2">Last</th>
          <th key="psh3"></th>
          <th key="psh4">Date</th>
          <th key="psh5"></th>
          <th key="psh6"></th>
        </tr>
      </thead>
      <tbody>
      {sp.map((e,i) => (
      	<tr key={"psr"+i}>
          <td key={"ps"+i+"-1"}>{e.service}</td>
          <td key={"ps"+i+"-2"}>{e.lastPayment ? e.lastPayment.amount : null}</td>
          <td key={"ps"+i+"-3"}>{e.lastPayment ? e.lastPayment.ccy : null}</td>
          <td key={"ps"+i+"-4"}>{e.lastPayment ? e.lastPayment.date : null}</td>
            <td key={"ms"+i+"-5"}>
              <button className="startBtn" onClick={()=>changePayment(e.service)} data-meter={e.service}>
                <span>Change</span>
              </button>
            </td>
            <td key={"ms"+i+"-6"}>
              <ServiceInfo serviceData={e} />
            </td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>
  )
  };
  
  const getChangePane = (service) => {
  	return (
    <ChangePayment 
      actFlat={actFlat}
      actService={service}
      actData={providers.filter(e=>e.service==service)[0]}
      changePayment={paymentChangeSubmitted}
      cancel={paymentChangeCancelled}
      />);
  };
  
  return (
  	state=="show" ? getPaymentsPane() : getChangePane(actMeter)
  );
}

function ChangeMeterReading({actFlat, actMeter, actData, changeReading, cancel}){

console.log(`ChangeMeterReading :: actFlat=${actFlat.key}, actMeter=${actMeter}, actData=${actData.date}, ${actData.last}, ${actData.unit}`);
	
  const [newData, setNewData] = useState({date: date2string(new Date()), last: actData.last});
  
  const dateChanged = e => {
  	const newVal = {date: e.target.value, last: newData.last};
    setNewData(newVal);
    console.log(`dateChanged: newVal=[${newVal.date}, ${newVal.last}]`);
  };
  
  const readingChanged = e => {
  	const newVal = {date: newData.date, last: e.target.value};
    setNewData(newVal); 
    console.log(`readingChanged: newVal=[${newVal.date}, ${newVal.last}]`); 
  };
  
  const submitChange = () => {
  	console.log(`ChangeMeterReading.submitChange ${actFlat.key}.${actMeter} := [${newData.date}, ${newData.last}]`);
  	changeReading(actFlat.key, actMeter, newData);
  };
  
  const cancelChange = () => {
  	cancel();
  };
  
	return (
  <div>
		<table key="crh">
      <tbody>
        <tr key="crh-meter">
          <td key="crh-meter-key">
            {actMeter}
          </td>
          <td key="crh-meter-provider">
            
          </td>
        </tr>
      </tbody>
    </table>
        <table key="crb">
    <thead>
      <tr key="crbh">
        <th key="crbh-date">
          Date
        </th>
        <th key="crbh-reading">
          Reading
        </th>
        <th key="crbh-unit">
          Unit
        </th>
      </tr>
    </thead>
    <tbody>
    	<tr key="crbb-act">
    	  <td key="crbb-act-date">
    	    {actData.date}
    	  </td>
    	  <td key="crbb-act-reading">
    	    {actData.last}
    	  </td>
    	  <td key="crbb-act-unit">
    	    {actData.unit}
    	  </td>
    	</tr>
    	<tr>
    	  <td key="crbb-new-date">
    	    <input type="date" value={newData.date} 
            onChange={dateChanged}
          />
    	  </td>
    	  <td key="crbb-new-reading">
    	    <input type="number" value={newData.last} 
            onChange={readingChanged}
          />
    	  </td>
    	  <td key="crbb-new-unit">
    	    {actData.unit}
    	  </td>
    	</tr>
      <tr>
        <td>
          <button onClick={cancelChange}>Cancel</button>
        </td>
        <td />
        <td>
          <button onClick={submitChange}>Submit</button>
        </td>
      </tr>
      </tbody>
    </table>
    
    </div>
  );
}


function App({isDemo, demoData}){

	const [actFlat, setActFlat] = useState(isDemo ? (demoData.flats[0] ? demoData.flats[0] : 'N/A') : 'N/A');
  const [flats, setFlats] = useState(isDemo ? demoData.flats : []);
  const [readings, setReadings] = useState(isDemo ? demoData.readings : {});
  const [services, setServices] = useState(isDemo ? demoData.services : {});
  const [payments, setPayments] = useState(isDemo ? demoData.payments : {});
  const [valueIsChanging, setValueIsChanging] = useState(false);

	const changeFlat = (e) => {
  	//console.log(`App.changeFlat :: to ${key}`);
    let key=e.target.value;
    setActFlat(flats.filter(e=>e.key==key)[0]);
  };
  
  const changeReading = (flatKey, inMeter, newData) => {
  	console.log(`App :: changeReading ${flatKey}.${inMeter} := ${newData.date}, ${newData.last}]`);
    if(isDemo){
    	let newReadings = JSON.parse(JSON.stringify(readings));
      let idx = newReadings[flatKey].findIndex(e=>e.meter==inMeter);
      newReadings[flatKey][idx].date = newData.date;
      newReadings[flatKey][idx].last = newData.last;
      setReadings(newReadings);
      setValueIsChanging(false);
      console.log(`App :: changeReading done`);
    }
  };
  
  const changePayment = (flatKey, inProvider, newData) => {
  	console.log(`App :: changePayment ${flatKey}.${inProvider} := ${newData.date}, ${newData.last}]`);
    if(isDemo){
      setValueIsChanging(false);
      console.log(`App :: changePayment done`);
    }
  };
  
  const valueBeingChanged = (b) => {
  	setValueIsChanging(b);
  };
  
  const getFlatSelector = (b) => {
  	if(b){
    	return (
      		<select value={actFlat.key} onChange={changeFlat}
              disabled="disabled">
            {flats.map((e) => (
              <option key={"f"+e.key} value={e.key}>{e.key}</option>
            ))}
          </select>
      );
    } else {
    	return (
      		<select value={actFlat.key} onChange={changeFlat}>
            {flats.map((e) => (
              <option key={"f"+e.key} value={e.key}>{e.key}</option>
            ))}
          </select>
      );    
    }
  }
  
  const condServices = (b) => {
  	if(b) return (
    <Services
      services={services[actFlat.key]}
      payments={payments[actFlat.key]}
      actFlat={actFlat}
      flats={flats}
      flatChanged={changeFlat}
      changePayment={changePayment}
      valueBeingChanged={valueBeingChanged}
    />
    );
  }
	
  return (
  	<div>
      <table key="flat"><tbody><tr><td key="selflat">
          {getFlatSelector(valueIsChanging)}
        </td><td key="flatdesc">
        <span className="flatdesc">{actFlat.desc}</span>
        </td>
        </tr></tbody>
      </table>
  	<MeterReadings
      readings={readings[actFlat.key]}
      actFlat={actFlat}
      flats={flats}
      flatChanged={changeFlat}
      changeReading={changeReading}
      valueBeingChanged={valueBeingChanged}
    />
    
    {condServices(services[actFlat.key])}
    
    </div>
    
  );
  
}

const demoData={
flats : [
  	 {key: "VISEGRÁDI", desc: "1132 Bp., Visegrádi u. 42-46., 8/78"}
    ,{key: "HUNYADI", desc: "1067 Bp., Hunyadi tér , 3/25"}
  ],
readings : {
  	 "VISEGRÁDI" : [
     		 {meter: "GAS", last: 10, unit: "m3", date: '2023-03-31'}
        ,{meter: "WATER", last: 20, unit: "m3", date: '2023-04-10'}
        ,{meter: "ELECTRICITY", last: 30, unit: "kWh", date: '2023-04-21'}
    	]
    ,"HUNYADI" : [
     		 {meter: "WATER", last: 303, unit: "m3", date: '2023-02-28'}
        ,{meter: "ELECTRICITY", last: 12345, unit: "kWh", date: '2023-01-30'}
    	]
  },
payments : {
  	 "VISEGRÁDI" : [
     		 {service: "GAS", amount: 100, ccy: "HUF", date: '2023-04-10'}
        ,{service: "WATER", amount: 210, ccy: "HUF", date: '2023-04-18'}
        ,{service: "ELECTRICITY", amount: 320, ccy: "HUF", date: '2023-04-28'}
    	]
    ,"HUNYADI" : [
     		 {service: "WATER", amount: 400, ccy: "HUF", date: '2023-03-05'}
        ,{service: "ELECTRICITY", amount: 500, ccy: "HUF", date: '2023-02-10'}
    	]
  },
services : {
  	 "HUNYADI" : [
     		 {service: "GAS", readable: true, provider: "MVM"
         			,electronic: {url: "https://www.vodafone.hu/myvodafone/szolgaltatasaim", user: "ibalogh@gmail.hu", pw: "PW1"}
              ,comment: "nagyapa nevében havonta belép-fizet"
              ,contractual: {"Vevő/Fizető azon":"5000279499"}
         }
        ,{service: "ELECTRICITY", readable: true, provider: "MVM"
         			,electronic: {url: "https://ker.mvmnext.hu", user: "KUTAI JUDIT", pw: "PW2"}
              ,comment: "Bérlő diktál, Judit elektr. fizet, Bérlő átutalja. Diktálás hónap 1-8. közt"
              ,contractual: {"Vevő/Fizető azon":"5000279499"}
         }
        ,{service: "INTERNET", readable: false, provider: "MVM"
         			,electronic: {url: "https://www.vodafone.hu/myvodafone/szolgaltatasaim", user: "ibalogh@gmail.hu", pw: "PW3"}
              ,comment: "nagyapa nevében havonta belép-fizet"
              ,contractual: {"Vevő/Fizető azon":"5000279499"}
         }
        ,{service: "GARBAGE", readable: false, provider: "MOHU", comment: "postán levelet küld, átutalással fizethető"}
        ,{service: "INSURANCE", readable: false, provider: "UNIQA", comment: "Csoportos beszedés Raiffeisen számlán"
              ,contractual: {"Ktvszám":"WK01837177"}}
     ]
    ,"VISEGRÁDI" : [
     		 {service: "ELECTRICITY", readable: true, provider: "MVM"
         			,electronic: {url: "https://ker.mvmnext.hu", user: "BALOGHE79", pw: "PW5"}
              ,comment: "gmail.hu-ra jön levél, vagy MVM honlapon fizet"
              ,contractual: {"Vevő/Fizető azon":"5000123456"}
         }
     ]
}
};

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App isDemo={true} demoData={demoData} />);
