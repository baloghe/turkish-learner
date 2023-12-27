
/* example: https://www.cairn.info/revue-guerres-mondiales-et-conflits-contemporains-2001-2-page-167.htm */

function getHeader(ndRoot, headLevel){
	return '<h' + (headLevel+1) + '>' + ndRoot.textContent + '</h' + (headLevel+1) + '>';
}
function getPara(ndRoot){
	return '<p>' 
			+ Array.from(ndRoot.childNodes)
				.filter(n=>(n.nodeName=='SPAN' || n.nodeType==3))
				.map(n=>n.textContent)
				.join('')
			+ '</p>';
}
function getSection(ndRoot, headLevel){
	
	let chd = Array.from(ndRoot.childNodes)
				.filter(n=>(   n.nodeName=='H1' 
							|| n.nodeName=='H2' 
							|| n.nodeName=='H3' 
							|| n.nodeName=='H4' 
							|| n.nodeName=='H5' 
							|| n.nodeName=='P' 
							|| n.nodeName=='SECTION'
							)
						)
				;
				
	return chd.map(n=>{
		if(n.nodeName=='H1' || n.nodeName=='H2' || n.nodeName=='H3' || n.nodeName=='H4' || n.nodeName=='H5' ){
			return getHeader(n, headLevel);
		} else if(n.nodeName=='P') {
			return getPara(n);
		} else if(n.nodeName=='SECTION') {
			return getSection(n, headLevel+1);
		}
	}).join('\n');
}
function getAsana(ndRoot){
	let chd = Array.from(ndRoot.childNodes);
	
	let ret = [];
	chd.forEach(nd => {
		if(nd.nodeType==3){
			//ret.push(getPara(nd));
			ret.push(nd.textContent);
			//console.log(`found ${nd.nodeName} :: ${nd.nodeType} => push`);
		} else if(['H1','H2','H3','H4','H5','H6','P','OL','UL','LI','B','I','SPAN'].includes(nd.nodeName)){
			//console.log(`visit node ${nd.nodeName}`);
			let s = getAsana(nd);
			if(s!=null && s.length > 0){
				ret = [...ret, '<' + nd.nodeName.toLowerCase() + '>', ...s, '</' + nd.nodeName.toLowerCase() + '>'];
			}
		} else if(['DIV','SECTION'].includes(nd.nodeName)){
			//console.log(`visit node ${nd.nodeName}`);
			let s = getAsana(nd);
			if(s!=null && s.length > 0){
				ret = [...ret, ...s];
			}
		}
	});
	
	return ret;
}


/*
usage: 
CAIRN (https://www.cairn.info/)  :: getSection( document.getElementById('s1n1') ,1)
ASANA (https://asana.com/)  :: getAsana(document.getElementById('__next')).join('')
*/
