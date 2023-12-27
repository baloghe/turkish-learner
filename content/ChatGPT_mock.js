const useState = React.useState;
const useEffect = React.useEffect;

const ChatGPT_Key="provide your own!";

function SettingsPane({actSettings, changeSettings}){
	const [settings, setSettings] = useState(actSettings);

	const submitChange = () => {
  	changeSettings(settings);
  };

	return (
  	<div>
    <h2>Settings</h2>
      <button onClick={submitChange}>Submit</button>
    </div>
  );
}

function ChatPane({actMessages, sendNewMessage, chatState}){
	const [userMsg, setUserMsg] = useState('');

	console.log(`ChatPane :: state=${chatState}`);

	const sendMessage = e => {
  	e.preventDefault();
    e.target.reset();
		const mev = {
			message: userMsg,
			sender: 'user'
		};
		sendNewMessage(mev); //so we go back to App with our local variable
		console.log(`ChatPane :: Msg sent: ${userMsg}`);
	};
	
	return (
		<div>
    {actMessages.map((m,i)=>(<p key={i}><b>{m.sender}:</b>{m.message}</p>))}
			{chatState==='WAIT' ? <p>Waiting for answer...</p>
				:<form onSubmit={sendMessage}>
					<input type="text" onChange={e => setUserMsg(e.currentTarget.value)} required />
					<button type="submit">Go</button>
				</form>
			}
		</div>
	);
}

function App({preSet}){
	const [settings, setSettings] = useState(preSet);
	const [messages, setMessages] = useState([]);
	const [state, setState] = useState('SETTINGS');
  const [chatState, setChatState] = useState('TYPE');
  
  let timerID = null;
  let newMsgs = null;
  
	const changeSettings = d => {
		console.log(`App :: settings changed`);
		setState('CHAT');
	};
  
  const askLLM_old = () => {
    	let answer="This is a hard question";
      newMsgs = [...newMsgs, {message: answer, sender: "ChatGPT"}];
      console.log('  Timeout ended');
      setMessages(newMsgs);
			setChatState('TYPE');
  };
  
  //taken from https://github.com/coopercodes/ReactChatGPTChatbot/tree/main
  async function askLLM (allMessages) {
  	const apiMsg = allMessages.map(m=>{
    	return { role: m.sender==="user" ? "user" : "assistant"
              ,content: m.message};
    });
    const request = {
      "model": "gpt-3.5-turbo",
      "messages": [
        {"role": "system", "content": "Explain things like you're talking to a fourth grader."},
        ...apiMsg
      ]
    };
    await fetch("https://api.openai.com/v1/chat/completions",
        {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + ChatGPT_Key,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...allMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
    });
  };
	
	const sendNewMessage = async (msg) => {
		newMsgs = [...messages, msg];
    setMessages(newMsgs);
		console.log('Ask some GPT');
    setChatState('WAIT');
    await askLLM(newMsgs);
    setChatState('TYPE');
	};
	
	return (state==='SETTINGS'
			? <SettingsPane changeSettings={changeSettings} />
			: <ChatPane actMessages={messages} sendNewMessage={sendNewMessage} chatState={chatState} />
			);
  
}

const preSet={};

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App preSet={preSet} />);