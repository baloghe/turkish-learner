import React, {useState} from 'react';

const txt2stc = (t) => t.split('\n').map(e => e.split('\t'));

/***/
function TitleCard({title, titleDragged, columnID}){
  const [dragEnabled, setDragEnabled] = useState(true);

  const doNothing = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", title);
	titleDragged(title);
	//console.log(`drag start: ${title}`);
  };

  return (
    <div className='dragitem'
      key={title}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <p>{title}</p>
    </div>
  );
}

function TitleColumn({columnTitle, titles, columnID, moveItem}){

  const [dragging, setDragging] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    let title = e.dataTransfer.getData("text/plain");
    if(titles.includes(title)){
		//dropped on self => do nothing
		//console.log(`drop to SELF: ${title}`);
	} else {
		//dropped here from another container
		//console.log(`drop ${title} HERE: ${columnID}`);
		moveItem(columnID, title);
	}
	setDragging(null);
  };
  
  const handleDragOver = (e) => {
	  e.preventDefault();
	  let data = e.dataTransfer.getData("text");
  };
  
  const titleDragged = (title) => {
	  setDragging(title);
	  //console.log(`App.titleDragged: ${title}`);
  };
  
  return (
    <div className='droparea'
	  droppable="true"
      onDrop={handleDrop}
	  onDragOver={handleDragOver}
	>
      <h3>{columnTitle}</h3>
      <div>
        {titles.map((e,i) => (
				<TitleCard key={i} title={e} titleDragged={titleDragged} /> 
			) )
		}
      </div>
    </div>
  );
}

function SelectFromListPane({multiChoice, titles, selConfirmed, selCancelled}) {
	
	const [fromLst, setFromLst] = useState(titles);
	const [toLst, setToLst] = useState([]);
	
	const moveTitle = (toID, title) => {
		let origFrom = fromLst.map(e=>e);
		let origTo = toLst.map(e=>e);
		
		if(toID==="FROM"){
			origTo = origTo.filter( e => (e!== title) );
			origFrom = [title, ...origFrom];
		} else {
			origFrom = origFrom.filter( e => (e!== title) );
			origTo = [title, ...origTo];
		}
		
		//console.log(`origFrom: ${origFrom} , origTo: ${origTo}`);
		//console.log(`multiChoice=${multiChoice} , origTo.length = ${origTo.length}`);
		
		if(multiChoice && origTo.length > 1){
			//new item placed at index 0
			let excess = origTo[1];
			origFrom = [...origFrom, excess];
			origTo = [origTo[0]];
		}
		
		//apply consolidated changes
		setFromLst(origFrom);
		setToLst(origTo);
	};
	
  const ok = () => selConfirmed(toLst);
  const cancel = ()=> selCancelled();
	
  return (
    <div className='App'>
	<form onSubmit={ok}>
      <table>
		<tbody>
			<tr key="1">
				<td key="1"><TitleColumn columnTitle="Available" titles={fromLst} columnID="FROM" moveItem={moveTitle} /></td>
				<td key="2"><TitleColumn columnTitle="Chosen" titles={toLst} columnID="TO" moveItem={moveTitle} /></td>
			</tr>
			<tr key="2">
				<td key="1"><button onClick={cancel}>Cancel</button></td>
				<td key="2"><button onClick={ok}>OK</button></td>
			</tr>
		</tbody>
	  </table>
	</form>
    </div>
  );
}
/***/

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

function ListQuizPane({returnTo, quiz}){
	
  const [langFrom, setLangFrom] = useState(quiz.langs['L1']);
  const [langTo, setLangTo] = useState(quiz.langs['L2']);
	
	const submit = (e) => {
	  e.preventDefault();
	  returnTo();
	};
	
	return(
  	<div>
      <h2>{quiz.title}</h2>
	<table border="1" cellPadding="10" cellSpacing="0">
        <thead>
		  <tr>
            <th key="1">{quiz.langs['L1']}</th>
            <th key="2">{quiz.langs['L2']}</th>
		  </tr>
        </thead>
        <tbody>
          {quiz.sentences.map((item,i) => (
            <tr key={i}>
              <td key={"L1-"+i}>{item['L1']}</td>
              <td key={"L2-"+i}>{item['L2']}</td>
            </tr>
          ))}
        </tbody>
      </table>
		<form onSubmit={submit}>
			<button onClick={submit}>OK</button>
		</form>
    </div>
  );
}

function ResultPane({returnTo, titles}){
	
	const submit = (e) => {
	  e.preventDefault();
	  returnTo();
	};
	
	return(
  	<div>
      <h2>Results</h2>
		<p>{titles.join(', ')}</p>
		<form onSubmit={submit}>
			<button onClick={submit}>Ok</button>
		</form>
    </div>
  );
}

function ActionChoicePane({returnTo}){
	
	const delAction = () => {returnTo('CHOOSETODEL')};
	const addAction = () => {returnTo('INPUT')};
	const listAction = () => {returnTo('CHOOSETOLIST')};
	
	return(
  	<div>
		<form onSubmit={delAction}>
			<button onClick={delAction}>Delete quizzes</button>
		</form>
		<form onSubmit={addAction}>
			<button onClick={addAction}>Add new quiz</button>
		</form>
		<form onSubmit={listAction}>
			<button onClick={listAction}>List a quiz</button>
		</form>
    </div>
  );
}

function TitleChoicePane({multiChoice, titles, action}){
	
	const selConfirmed = (lst) => {
		action(lst);
	};
	
	const selCancelled = () => {
		action(null);
	};
	
	return (
		<SelectFromListPane multiChoice={multiChoice} titles={titles} selConfirmed={selConfirmed} selCancelled={selCancelled} />
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
  const [quiz, setQuiz] = useState(null);
  
  const loginDone = () => {
  	setLoggedIn (true);
    resetState();
  };
  
  const resetState = () => {
    //Async read from DB
    //result: list of existing titles
    setTitles(['mock 1' , 'mock 2']);
  
	setActState ('CHOOSEACTION');
  };
  
  const chooseAction = (s) => {
	  console.log(`chooseAction :: change state from ${actState} -> ${s}`);
	  setActState(s);
  };
  
  const listQuiz = (title) => {
	  if(title===null){
		  console.log(`Listing cancelled`);
		  setActState ('CHOOSEACTION');
	  } else {
		  console.log(`Quiz to be listed: ${title}`);
		  
		  //Async read from DB
		  //result: quiz
		  setQuiz({title: "Sen hep gülümse",
				   langs: {L1: 'TR', L2: 'EN'},
				   sentences: [{L1: "Gülmeyeceksin!", L2:"You won't laugh!"}
							  ,{L1: "Gülerim", L2:"I laugh."}]
					});
		  
		  setActState ('LISTQUIZ');
	  }
  };
  
  const deleteQuiz = (titles) => {
	  if(titles===null){
		  console.log(`Deletion cancelled`);
		  setActState ('CHOOSEACTION');
	  } else {
		  console.log(`Quizzes to be deleted: ${titles}`);
		  
		  //Async write to DB
		  //result: list of existing titles
		  setTitles(['mock 1' , 'mock 2']);
		  
		  setActState ('RESULT');
	  }
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
	if(actState==='INPUT'){
		return (<InputPane submitQuiz={submitQuiz}/>);
	} else if(actState==='RESULT'){
		return (<ResultPane returnTo={resetState} titles={titles}/>);
	} else if(actState==='LISTQUIZ'){
		return (<ListQuizPane returnTo={resetState} quiz={quiz}/>);
	} else if(actState==='CHOOSEACTION'){
		return (<ActionChoicePane returnTo={chooseAction}/>);
	} else if(actState==='CHOOSETODEL'){
		return (<TitleChoicePane multiChoice={true} titles={titles} action={deleteQuiz}/>);
	} else if(actState==='CHOOSETOLIST'){
		return (<TitleChoicePane multiChoice={false} titles={titles} action={listQuiz}/>);
	}
  }
}
