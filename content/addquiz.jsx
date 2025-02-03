import React, {useState} from 'react';

//https://playcode.io/react

const txt2stc = (t) => t.split('\n').map(e => e.split('\t'));

function LoginPane({loginSuccess}){
	const [state, setState] = useState('ENTER');
	const [user, setUser] = useState('');
  const [pw, setPW] = useState('');
  
  const login = (e) => {
  	e.preventDefault();
    //replace with Async call to server...
    if(user==='baloghe' && pw==='pw'){
    	setState('OK');
    	loginSuccess();
    } else {
    	setState('ERROR');
    }
  };
 
  return (
  	<div>
      <h2>Log in</h2>
    <form onSubmit={login}>
      <label htmlFor="user">User: </label>
      <input type="text" name="user" onChange={e => setUser(e.currentTarget.value)} required />
      <label htmlFor="pw">Password: </label>
      <input name="pw" type="password" onChange={e => setPW(e.currentTarget.value)} required />
      <button onClick={login}>Submit</button>
    </form>
    {state==='ENTER'
      ? <p></p>
      : state==='ERROR'
        ? <p>Wrong user or password!</p>
        : <p>Login successful</p>
    }
      </div>
    );//LoginPane.return()
}

function ResultPane({addNew, titles}){
	
	const submit = (e) => {
	  e.preventDefault();
	  addNew();
	};
	
	return(
  	<div>
      <h2>Results</h2>
		<p>{titles.join(', ')}</p>
		<form onSubmit={submit}>
			<button onClick={submit}>Add new quiz</button>
		</form>
    </div>
  );
}

function InputErrorPane({state, errors}){
	
	if((!state) && errors.length === 0){
		return (
			<div key="iep0">
				<p key="iep2">Type something!</p>
			</div>
			);
	}
	else if((!state) && errors.length > 0){
		return (
			<div key="iep0">
				<h3 key="iep1">Error!</h3>
				<p key="iep2">{errors}</p>
			</div>
			);
	} else return (
			<p>No errors</p>
			);
}

function InputSubmitPane({state, title, langFrom, langTo, listLen, loadQuiz}){
	
	const submit = (e) => {
	  e.preventDefault();
	  loadQuiz();
	};
	
	if(state) {
		return (<form key="isp4" onSubmit={submit}>
		         <h3 key="isp1">Title: {title}</h3>
				 <p key="isp2"><i>{langFrom} &rarr; {langTo}</i> :: {listLen} pairs</p>
				<button onClick={submit}>Submit</button>
			   </form>);
	} else {
		return (<p></p>);
	}
}

function InputPane({submitQuiz}){
  const [state, setState] = useState(false);
  const [errors, setErrors] = useState('');
  const [title, setTitle] = useState('');
  const [langFrom, setLangFrom] = useState('TR');
  const [langTo, setLangTo] = useState('EN');
  const [qtext, setQtext] = useState('');
  const [list, setList] = useState([]);

  const submit = (e) => {
	  e.preventDefault();
    setList(txt2stc(qtext));
	  
  	if(check()){
  		setState(true);
  	} else {
		setState(false);
		console.log(errors);
	}
  };

  const check = () => {
    let ret = true;
    let errtxt=[];

    //title
    if(title.trim().length===0){
      ret = false;
      errtxt = [...errtxt , "missing TITLE"];
    }
    //languages
    if(langFrom.trim().length===0){
      ret = false;
      errtxt = [...errtxt , "missing L1"];
    }
    if(langTo.trim().length===0){
      ret = false;
      errtxt = [...errtxt , "missing L2"];
    }
    //content
    if(list.length===0){
      ret = false;
      errtxt = [...errtxt , "missing sentences"];
    } else {
      let err_sents = [];
	  let i = 0;
	  for(e of list){
		  i++;
		  if( e.length !== 2){
			  err_sents = [...err_sents , i];
		  }
	  }//next e
	  if(err_sents.length > 0){
		  errtxt = [...errtxt , "wrong sentences: " + err_sents.join(", ")];
	  }
    }
	
	//finally
	setErrors(errtxt.join("; "));
	return (errtxt.length === 0);
  };
  
  const loadQuiz = () => {
	  submitQuiz(title, langFrom, langTo, list);
  };

	return (
  	<div>
      <h2>Input Quiz Data</h2>
      <form onSubmit={submit}>
          <label htmlFor="title">Title: </label>
          <input type="text" name="title" onChange={e => setTitle(e.currentTarget.value)} required />
          <label htmlFor="lfrom">L1: </label>
          <input name="lfrom" value="TR" onChange={e => setLangFrom(e.currentTarget.value)} required />
          <label htmlFor="lto">L2: </label>
          <input name="lto" value="EN" onChange={e => setLangTo(e.currentTarget.value)} required />
		  <br/>
          <label htmlFor="txt">Sentences: </label>
          <textarea name="txt" onChange={e => setQtext(e.currentTarget.value)} required />
        <button onClick={submit}>Check it!</button>
      </form>
	  {!state && <InputErrorPane state={state} errors={errors} />}
	  {state && <InputSubmitPane state={state} title={title} langFrom={langFrom} langTo={langTo} listLen={list.length} loadQuiz={loadQuiz} />}
    </div>
  );
}

export function App(aState){
	const [actState, setActState] = useState(aState);
  const [loggedIn, setLoggedIn] = useState(false);
  const [titles, setTitles] = useState([]);
  
  const loginDone = () => {
  	setLoggedIn (true);
    resetState();
  };
  
  const resetState = () => {
	setActState ('INPUT');
  };
  
  const submitQuiz = (title, l1, l2, lst) => {
	  console.log(`Quiz to be added: ${title} :: ${l1} -> ${l2} , ${lst.length} pairs`);
	  
	  //Async write to DB
	  //result: list of existing titles
	  setTitles(['mock 1' , 'mock 2' , title]);
	  
	  setActState ('RESULT');
  };
  
  if(!loggedIn){
  	//return Login screen
    return <LoginPane loginSuccess={loginDone} />;
  } else {
  	//Either Input or Results
    return (actState==='INPUT'
                    ? <InputPane submitQuiz={submitQuiz}/>
                    : <ResultPane addNew={resetState} titles={titles}/>
    			 );
  }
}
