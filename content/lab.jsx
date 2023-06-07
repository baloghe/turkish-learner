const useState = React.useState;

function Tile({caption, isMovable}){
	
  const [movable, setMovable] = useState(isMovable);
  
  const actClassNames = x => "tile" + " " + (x ? "tile-movable" : "tile-frozen");
  
  //console.log(`movable=${movable}, actClassNames=${actClassNames(movable)}`);

	return (
  <div className={actClassNames(movable)}>
    {caption}
  </div>
  );
}



function Arrow({caption, isPushable, arrowClicked, idx, direction}){
	
  const [pushable, setPushable] = useState(isPushable);
  
  const handleClick = () => {
  	arrowClicked(idx, direction);
  }
  
  const actClassNames = x => "arrow" + " " + (x ? "arrow-pushable" : "arrow-frozen");
  
  //console.log(`movable=${movable}, actClassNames=${actClassNames(movable)}`);

	return (
  <div className={actClassNames(pushable)} onClick={handleClick}>
    {caption}
  </div>
  );
}

function Board({rows, cols, tiles}){

	const [tileGrid, setTileGrid] = useState(tiles);

	const shiftRow = (r, d) => {
    let si = r*parseInt(cols);
    let ei = si+parseInt(cols)-1;
    let newGrid = tileGrid.map(e=>e);
  	//d>0 => shift to the right
    if(d>0){
      let rm = newGrid.splice(ei,1);
      newGrid.splice(si,0,rm[0]);
    //otherwise: shift to the left
    } else {
    	let rm = newGrid.splice(si,1);
      newGrid.splice(ei,0,rm[0]);
    }
    //replace
    setTileGrid(newGrid);
  };
  
  const shiftCol = (c, d) => {
  	let si = c;
    let ei = si+(parseInt(rows)-1)*parseInt(cols);
    //d>0 => shift down
    let idxs;
    if(d>0){
    	idxs = Array.from({length: parseInt(rows)}, (v, i) => si+i*parseInt(cols));
    //else shift up
    } else {
    	idxs = Array.from({length: parseInt(rows)}, (v, i) => ei-i*parseInt(cols));
    }
    //console.log(`shiftCol :: si=${si}, ei=${ei}, idxs=${JSON.stringify(idxs)}`);
    //change array elements one by one
    let newGrid = tileGrid.map(e=>e);
    for(let i=0; i<idxs.length-1; i++){
    	[ newGrid[idxs[i]] , newGrid[idxs[i+1]] ] = [ newGrid[idxs[i+1]] , newGrid[idxs[i]] ];
      console.log(`shiftCol :: i=${i}, swap ${idxs[i]} and ${idxs[i+1]}`);
    }
    //replace
    setTileGrid(newGrid);
  };

	const pushable = new Map();
  for(let r = 0; r<parseInt(rows)+2; r++){
  	for(let c = 0; c<parseInt(cols)+2; c++){
    	if(  ((r==0 || r==parseInt(rows)+1) && c>0 && c<parseInt(cols)+1)
         ||((c==0 || c==parseInt(cols)+1) && r>0 && r<parseInt(rows)+1))
      {
      	//console.log(`add ${r+'|'+c}`);
      	pushable.set(r+'|'+c,true);
      }
    }//next c
  }//next r

	const getEmptyCell = (r,c) => {
  	return (
        <td key={'e'+r+'-'+c} />
        );
  }
  
  const getControl = (r,c,m) => {
  	let caption, dir, cbk, idx;
    if(c==0){
    	//shift left
      caption = '\u21d0';
      dir = -1;
      cbk = shiftRow;
      idx = r-1;
    } else if(c==(parseInt(cols)+1)) {
    	//shift right
      caption = '\u21d2';
      dir = 1;
      cbk = shiftRow;
      idx = r-1;
    } else if(r==(parseInt(rows)+1)) {
    	//shift down
      caption = '\u21d3';
      dir = 1;
      cbk = shiftCol;
      idx = c-1;
    } else {
    	//shift up
      caption = '\u21d1';
      dir = -1;
      cbk = shiftCol;
      idx = c-1;
    }
    return (
        <td key={'c'+r+'|'+c}>
          <Arrow
            caption={caption}
            isPushable={m}
            arrowClicked={cbk}
            idx={idx}
            direction={dir}
          />
        </td>
    );
  }

  const getTile = (c,m,i) => {
    return (
        <td key={'c'+i}>
          <Tile caption={c} isMovable={m} />
        </td>
        );
  }

  const getRow = (r) => {
    //console.log(`  getRow :: s=${s}, c=${c}`);
    let ret = [];
    if( r==0 || r==parseInt(rows)+1 ){
    	//pure control row
      for(let y=0; y<parseInt(cols)+2; y++){
      	if(y==0 || y==(parseInt(cols)+1)){
        	//empty cell
          ret.push(getEmptyCell(r,y));
        } else {
        	//control button
          ret.push(getControl(r,y,pushable.get(r+'|'+y)));
        }
      }
    } else {
    	//mixed row
      //left arrow
      ret.push( getControl(r,0,pushable.get(r+'|0')) );
      //tiles
      const s=(r-1)*parseInt(cols);
      for(let i=s; i<s+parseInt(cols); i++){
        //console.log(`  getRow :: i=${i}, upper=${upper}`);
        ret.push( getTile(tileGrid[i], true, i) );
      }
      //right arrow
      ret.push( getControl(r,parseInt(cols)+1,pushable.get(r+'|'+(parseInt(cols)+1))) );
    }
    return ret;
  }

  const genRows = () => {
    let i=0;
    const ret = [];
    for(r=0; r<parseInt(rows)+2; r++){
      //console.log(`genRows :: r=${r}`);
      ret.push(<tr key={'r'+r}>
                {getRow(r)}
              </tr>
              );
    }
    return ret;
  }

  return (
  <table><tbody>
    {genRows()}
  </tbody></table>
  );
}

ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<Board 
rows="2"
cols="3"
tiles={[1,2,3,4,5,6]}
/>);
/*
ReactDOM.createRoot( 
  document.querySelector('#root')
).render(<App 
rows="2"
cols="3"
/>);
*/
