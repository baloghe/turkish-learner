const useState = React.useState;
const useEffect = React.useEffect;

function Child({header, actMessages, sendNewMessage}){
	const [userMsg, setUserMsg] = useState('');
  
  const sendMessage = e => {
  	e.preventDefault();
    e.target.reset();
    const newMessages = [...actMessages, userMsg];
		sendNewMessage(newMessages);
  };
	
  return (
  <div>
    <h2>{header}</h2>
    {actMessages.map((e,i)=><p key={i}>{e}</p>)}
    <form onSubmit={sendMessage}>
            <input type="text" onChange={e => setUserMsg(e.currentTarget.value)} required />
            <button type="submit">Go</button>
    </form>
  </div>
  );
  
}

function App(){
	const [head, setHead] = useState(0);
  const [messages, setMessages] = useState([]);
  
  const headers = ['write','me','something'];
  
  let timerID=null;
  timerID = setInterval(()=>{
  	let newHead = (head + 1) % headers.length;
    setHead(newHead);
  }, 2000);
  
  const sendNewMessage = msgs => {
  	setMessages(msgs);
  };
  
  return (
  	<Child header={headers[head]} actMessages={messages} sendNewMessage={sendNewMessage} />
  );
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App />);
