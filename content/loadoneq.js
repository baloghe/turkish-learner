const { MongoClient } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}`;

const mockTests = [
{title: "Özel Ders - Hande ve Azra",
 sentences: [{TR: "Vay be, gerçekten çalışıyormuş.", EN: "Wow, she really works."}
,{TR: "Bu mesleğin bir adı falan var mı?", EN: "Does this profession have a name?"}
,{TR: "İyi para vardır ha bu işte.", EN: "There's good money in this business."}
,{TR: "Hande! Seni hiç ilgilendirmez.", EN: "Hande! It's none of your business."}
,{TR: "Niye böyle bir meslek yapar ki insan?", EN: "Why does a person do such a profession?"}
,{TR: "Senin travman falan mı var?", EN: "Do you have a trauma or something?"}
,{TR: "Ay, müşteri geldi! Ay, sana müşteri geldi Azra!", EN: "Oh, a customer has arrived! Oh, you have a customer Azra!"}
,{TR: "Ne yapıyorsun ya?", EN: "What are you doing?"}
,{TR: "Ya sınır nedir bilmez misin sen?", EN: "Don't you know what limits are?"}
,{TR: "Ha demek böyle buluyorlar seni.", EN: "Oh, so that's how they find you."}
,{TR: "Söyleseydin ben de mesaj atardım ya.", EN: "If you had told me, I would have texted you too."}
,{TR: "Amma tantana yaptın yani.", EN: "But you made such a fuss."}
,{TR: "Öyle kolay zannediyorsun tabii.", EN: "Of course you think it's that easy."}
,{TR: "Referans nereden bulacaktın?", EN: "Where would you find a reference?"}
,{TR: "Teyzem referans olurdu bence bana.", EN: "I think my aunt would be a reference for me."}
,{TR: "Hatta… Neydi, dur, kızın adı? Dur. Sakın söyleme.", EN: "Even… What was, wait, the girl's name? Stop. Don't say it."}
,{TR: "Melisa da referans olurdu bence.", EN: "I think Melisa would also be a reference."}
,{TR: "Hani velisi gibi aradığın var ya?", EN: "You know the one you acted as a parent for?"}
,{TR: "Tamam, anlaşıldı. Senden kurtuluş yok.", EN: "OK, got it. One can't get away from you."}
,{TR: "Bu akşam Utku'nun evinde bir parti var.", EN: "There is a party at Utku's house this evening."}
,{TR: "Bilmiyorum haberin var mı.", EN: "I don't know if you heard about it."}
,{TR: "Onunla başlayım bakalım.", EN: "Let's start with that."}
,{TR: "Kural bir. Söylediklerime harfiyen uyacaksın.", EN: "There's one rule. You will obey exactly what I say."}
,{TR: "Tamam, söz.", EN: "OK promise."}
,{TR: "Hayatı kitaplardan öğrenemezsin.", EN: "You can't learn life from books."}
,{TR: "Pratik lazım sana.", EN: "You need practice."}
,{TR: "Şu saçmalıkları da kaldır.", EN: "Leave that nonsense."}
]
}
];

const mongoClient = new MongoClient(uri);

async function deleteOne(inTitle){
  let result = {};
	await mongoClient.connect()
    .then(connection=>connection.db(process.env.MONGODB_DB))
	.then(db=>db.collection('quiz'))
	.then(quiz=>quiz.deleteOne({title: inTitle}))
    .then(listing=>{ result = listing})
    .catch(error => console.log(error))
	;
  return result;
}

async function addOne(what){
  let result = {};
	await mongoClient.connect()
    .then(connection=>connection.db(process.env.MONGODB_DB))
	.then(db=>db.collection('quiz'))
	.then(quiz=>quiz.insertMany(what))
    .then(listing=>{ result = listing})
    .catch(error => console.log(error))
	;
  return result;
}

async function findListing(criteria){
  let result = [];
  await mongoClient.connect()
    .then(connection=>connection.db(process.env.MONGODB_DB))
	.then(db=>db.collection('quiz'))
	.then(quiz=>quiz.findOne(criteria))
    .then(listing=>{ result = listing})
    .catch(error => console.log(error))
	;
  return result;
}

async function getTitles(){
  let result = [];
  await mongoClient.connect()
    .then(connection=>connection.db(process.env.MONGODB_DB))
	.then(db=>db.collection('quiz'))
	.then(q=>q.find({}, {projection: {title: 1} } ))
	.then(cursor=>cursor.toArray())
    .then(listing=>{ result = listing.map(a=>a.title)})
    .catch(error => console.log(error))
	;
  return result;
}

async function loadOneQuiz (req, res) {
	
	try {
		let tit0 = mockTests[0].title;
		const del=await deleteOne(tit0);
		const add=await addOne(mockTests);
		//const fir=await findListing({});
		const tit=await getTitles();
		res.status(200).json({deleted: del.deletedCount , inserted: add.insertedCount , titles: tit});
	} catch (error) {
        res.status(500).json({ message: error.message })
    }
	
}

module.exports = loadOneQuiz;