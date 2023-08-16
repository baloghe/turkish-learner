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

function MeterReadings({readings, actFlat, flats, flatChanged, changeReading}){
	
  const [state, setState] = useState("show");
  const [actMeter, setActMeter] = useState();
  
  //readings: [...{meter: "", last: num, unit: "", date: date}]
  console.log(`MeterReadings :: ${readings.map((e,i)=>i+":"+e.meter)}`);
  
  const flatSelected = (e) => {
  	//console.log(`flatSelected :: ${e.target.value}`);
    flatChanged(e.target.value);
  };
  
  const readingChanged = (e) => {
  	console.log(`MeterReadings.readingChanged :: ${e}`);  
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
  };
  
  const getReadingsPane = () => {
  	return (
  <div>
  <h3>Meter Readings</h3>
      <table key="flat"><tbody><tr><td key="selflat">
        <select value={actFlat.key} onChange={flatSelected}>
          {flats.map((e) => (
            <option key={"f"+e.key} value={e.key}>{e.key}</option>
          ))}
        </select>
      </td><td key="flatdesc">
      <span className="flatdesc">{actFlat.desc}</span>
      </td>
      </tr></tbody>
    </table>
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

function Payments({payments, actFlat, flats, flatChanged}){

	//payments: [...{meter: "", amount: num, ccy: "", date: date}]
  console.log(`payments :: ${payments.map((e,i)=>i+":"+e.meter)}`);
  
  const flatSelected = (e) => {
  	//console.log(`flatSelected :: ${e.target.value}`);
    flatChanged(e.target.value);
  };
  
  const changePayment = (e) => {
  	console.log(`changePayment :: ${e}`);  
  };
  
  return (
  <div>
  <h3>Payments</h3>
      <table key="flat"><tbody><tr><td key="selflat">
        <select value={actFlat.key} onChange={flatSelected}>
          {flats.map((e) => (
            <option key={"f"+e.key} value={e.key}>{e.key}</option>
          ))}
        </select>
      </td><td key="flatdesc">
      <span className="flatdesc">{actFlat.desc}</span>
      </td>
      </tr></tbody>
    </table>
    <table id="payments" key="payments">
      <thead>
        <tr>
          <th key="psh1"></th>
          <th key="psh2">Last</th>
          <th key="psh3"></th>
          <th key="psh4">Date</th>
          <th key="psh5"></th>
        </tr>
      </thead>
      <tbody>
      {payments.map((e,i) => (
      	<tr key={"psr"+i}>
          <td key={"ps"+i+"-1"}>{e.meter}</td>
          <td key={"ps"+i+"-2"}>{e.amount}</td>
          <td key={"ps"+i+"-3"}>{e.ccy}</td>
          <td key={"ps"+i+"-4"}>{e.date}</td>
            <td key={"ms"+i+"-5"}>
              <button className="startBtn" onClick={()=>changePayment(e.meter)} data-meter={e.meter}>
                <span>Change</span>
              </button>
            </td>
        </tr>
      ))}
      </tbody>
    </table>
  </div>
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
        <tr key="crh-flat">
          <td key="crh-flat-key">
            {actFlat.key}
          </td>
          <td key="crh-flat-desc">
            {actFlat.desc}
          </td>
        </tr>
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

function Provider({actFlat, actMeter, actData}){
return (<div></div>
  );
}


function App({isDemo, demoData}){

	const [actFlat, setActFlat] = useState(isDemo ? (demoData.flats[0] ? demoData.flats[0] : 'N/A') : 'N/A');
  const [flats, setFlats] = useState(isDemo ? demoData.flats : []);
  const [readings, setReadings] = useState(isDemo ? demoData.readings : {});
  const [payments, setPayments] = useState(isDemo ? demoData.payments : {});

	const changeFlat = (key) => {
  	//console.log(`App.changeFlat :: to ${key}`);
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
      console.log(`App :: changeReading done`);
    }
  };
	
  return (
  	
  	<MeterReadings
      readings={readings[actFlat.key]}
      actFlat={actFlat}
      flats={flats}
      flatChanged={changeFlat}
      changeReading={changeReading}
    />
    /*
  	<Payments
      payments={payments[actFlat.key]}
      actFlat={actFlat}
      flats={flats}
      flatChanged={changeFlat}
    />
    */
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
     		 {meter: "GAS", amount: 100, ccy: "HUF", date: '2023-04-10'}
        ,{meter: "WATER", amount: 210, ccy: "HUF", date: '2023-04-18'}
        ,{meter: "ELECTRICITY", amount: 320, ccy: "HUF", date: '2023-04-28'}
    	]
    ,"HUNYADI" : [
     		 {meter: "WATER", amount: 400, ccy: "HUF", date: '2023-03-05'}
        ,{meter: "ELECTRICITY", amount: 500, ccy: "HUF", date: '2023-02-10'}
    	]
  }
};

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App isDemo={true} demoData={demoData} />);
