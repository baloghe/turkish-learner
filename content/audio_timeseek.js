let audioTag;
let btnPlay;
let actSentence;
let idx=0;

let sentences=[
 {sentence: "Taksi sizin mi, dışarıdaki?", start:0, end:3594}
,{sentence: "Çalışmıyorum abi ben.", start:3594, end:4778}
,{sentence: "Öyle mi? Böyle durumlarda hemen güvenlik birimlerine haber vermek lazım.", start:4778, end:9874}
,{sentence: "Alo, 155 mi? Bir saniye Memur Bey.", start:11000, end:15702}
,{sentence: "Neresi oğlum burası? Pınarköy abi.", start:15702, end:17839}
,{sentence: "İyi nöbetler efendim.", start:17839, end:18788}
,{sentence: "Taksici bir esnafımız burada yol beğenmiyor, müşteri seçiyor.", start:18800, end:23313}
,{sentence: "Nasıl yardımcı olabilirsiniz?", start:23313, end:25134}
,{sentence: "Ben Tuncay Uğurlu, Dışişleri´nden.", start:25134, end:27558}
,{sentence: "Paris Büyükelçisi Fuat Uğurlu´nun kardeşiyim. Ortanca, evet.", start:27558, end:31890}
,{sentence: "Tamam, siz memur gönderin ben bekliyorum.", start:31890, end:34483}
,{sentence: "Adresi verseydim.", start:34483, end:36561}
,{sentence: "Uydudan bulurlar. Sen dalga mı geçiyorsun yavrum?", start:36561, end:40554}
,{sentence: "Şu aleti her yerden okuyorlar. Tuncay Uğurlu, tak bitti.", start:40554, end:44842}
,{sentence: "Polisi karıştırmak istemezdim ama gelsinler işlem yapılsın, her şey ortaya çıksın.", start:44842, end:50524}
,{sentence: "Siz nereye gideceksiniz abi?", start:51524, end:53827}
,{sentence: "Hah, şöyle ya.", start:53827, end:55371}
,{sentence: "Valla nereye gideceğiz yavrum, tek yön var, aşağıya doğru gideceğiz işte.", start:55371, end:59071}
,{sentence: "Çayı şuradan alıver yavrum.", start:59071, end:60530}
,{sentence: "Abi, çorbaların parası?", start:63251, end:65198}
,{sentence: "Rica edeceğim, sizden para mı alacağız?", start:66118, end:69250}
,{sentence: "İyi akşamlar.", start:69250, end:70497}
];

for(let s of sentences){
	//console.log(`${s.start}-${s.end}`);
}

function start(){
	audioTag = document.getElementById("audio");
	btnPlay = document.getElementById("btnPlay");
	actSentence = document.getElementById("sntc");
	
	idxChanged();
	
	console.log(`audio.js loaded, src=${audioTag.src}`);
	
	audioTag.addEventListener("play", (evt) => {
		aplay(evt)
	});
	
	audioTag.addEventListener("pause", (evt) => {
		apause(evt)
	});
	
	btnPlay.addEventListener("click", (evt) => {
		audioTag.currentTime = sentences[idx].start / 1000;
		audioTag.play();
		
		let timerID = setTimeout(()=>{
							audioTag.pause();
							idx++;
							if(idx >= sentences.length){
								idx=0;
							}
							idxChanged();
						}, sentences[idx].end - sentences[idx].start + 1
						);
	});
	
	btnPlayAll.addEventListener("click", async (evt) => {
		let i=0;
		while(i<sentences.length){
			await playOne(i).then(x=>{i++});
		}
	});
}

async function playOne(i){
	actSentence.innerHTML=sentences[i].sentence;
	
	audioTag.currentTime = sentences[i].start / 1000;
	audioTag.play();
	
	let ms=sentences[i].end - sentences[i].start + 1;
	let timerID = setTimeout(()=>{
						audioTag.pause();
						clearTimeout(timerID);
					}, ms
					);
	
	await new Promise(resolve => setTimeout(resolve, ms));
	console.log(`i=${i} done`);
}

function idxChanged(){
	actSentence.innerHTML=sentences[idx].sentence;
}

function aplay(evt){
	console.log(`PLAY: ${Math.floor(audioTag.currentTime*1000)}`);	
}
function apause(evt){
	console.log(`PAUSE: ${Math.ceil(audioTag.currentTime*1000)}`);	
}
