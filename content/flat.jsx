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

function MeterStandings({standings, actFlat, flats, flatChanged}){
	
  //standings: [...{meter: "", last: num, unit: "", date: date}]
  console.log(`standings :: ${standings.map((e,i)=>i+":"+e.meter)}`);
  
  const flatSelected = (e) => {
  	//console.log(`flatSelected :: ${e.target.value}`);
    flatChanged(e.target.value);
  };
  
  const changeStanding = (e) => {
  	console.log(`changeStanding :: ${e}`);  
  };
  
  return (
  <div>
  <h3>Meter Standings</h3>
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
      {standings.map((e,i) => (
      	<tr key={"msr"+i}>
          <td key={"ms"+i+"-1"}>{e.meter}</td>
          <td key={"ms"+i+"-2"}>{e.last}</td>
          <td key={"ms"+i+"-3"}>{e.unit}</td>
          <td key={"ms"+i+"-4"}>{date2string(e.date)}</td>
            <td key={"ms"+i+"-5"}>
              <button className="startBtn" onClick={()=>changeStanding(e.meter)} data-meter={e.meter}>
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

function App(){

	const flats = [
  	 {key: "VISEGRÁDI", desc: "1132 Bp., Visegrádi u. 42-46., 8/78"}
    ,{key: "HUNYADI", desc: "1067 Bp., Hunyadi tér , 3/25"}
  ];
  
  const standings = {
  	 "VISEGRÁDI" : [
     		 {meter: "GAS", last: 10, unit: "m3", date: new Date('2023-03-31')}
        ,{meter: "WATER", last: 20, unit: "m3", date: new Date('2023-04-10')}
        ,{meter: "ELECTRICITY", last: 30, unit: "kWh", date: new Date('2023-04-21')}
    	]
    ,"HUNYADI" : [
     		 {meter: "WATER", last: 303, unit: "m3", date: new Date('2023-02-28')}
        ,{meter: "ELECTRICITY", last: 12345, unit: "kWh", date: new Date('2023-01-30')}
    	]
  };

	const [actFlat, setActFlat] = useState(flats[0] ? flats[0] : 'N/A');

	const changeFlat = (key) => {
  	//console.log(`App.changeFlat :: to ${key}`);
    setActFlat(flats.filter(e=>e.key==key)[0]);
  };
	
  return (
  	<MeterStandings
      standings={standings[actFlat.key]}
      actFlat={actFlat}
      flats={flats}
      flatChanged={changeFlat}
    />
  );
  
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App />);
