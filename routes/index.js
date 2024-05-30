var express = require('express');
var router = express.Router();

const axios = require("axios");
const fs = require("fs");


//OpenAI 참조하기
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});




/* 디폴트 메인 페이지 */
router.get('/', function(req, res, next) {
  //var test = process.env.OPENAI_API_KEY;
  res.render('index', { title: 'Express' });
});


/*
-서버 소켓과 연결된 모든 사용자간 채팅하기 웹페이지 요청과 응답
-http://localhost:3005/chat
*/
router.get('/chat',async(req,res,next)=>{
  res.render('chat.ejs');
});


/*
-특정 채팅방(채널) 사용자간 채팅하기 웹페이지 요청과 응답
-http://localhost:3005/groupchat
*/
router.get('/groupchat',async(req,res,next)=>{
  res.render('groupchat.ejs');
});



/*
 * dalle3 api 기반 TextToImage 생성 샘플
 */
router.get("/dalle3", async (req, res, next) => {
  let imageURL = "";
  let imageBinaryData = "";

  res.render("dalle3", { imageURL, imageBinaryData });
});


/*
 * dalle3 api 기반 TextToImage 이미지 생성 및 다운로드/저장 처리 
 */
router.post("/dalle3", async (req, res, next) => {

  let imageURL = "";
  let imageBinaryData = "";

  //a white siamese cat

  try {
    var model = req.body.version;
    var prompt = req.body.prompt;
    var size = req.body.size;
    var style = "vivid"; // vivid
    var response_format = "url"; //b64_json or url

    //참고URL: https://platform.openai.com/docs/api-reference/images/createEdit
    // {
    //   model: dall-e-2, dall-e-2(default) or dall-e-3
    //   prompt: a white siamese cat, 최대길이:dall-e-2:1000자,dall-e-3:4000자
    //   n: 1,  생성할 이미지수 ,기본값:1 , dall-e-2:1-10사이,dall-e-3:1만지원
    //   size: 생성할 이미지크기,dall-e-2의 경우 256x256, 512x512 또는 1024x1024(기본값) 중 하나,dall-e-3 모델의 경우 1024x1024(기본값), 1792x1024 또는 1024x1792 중 하나.
    //   quality:생성할 이미지품질, standard(default) or hd(dall-e-3만지원-세밀하고일관성이 뛰어남)
    //   response_format: 반환형식 , url(기본값=60분간만 유효함) or b64_json(binarydata)
    //   style: 기본값:vivid(선명하고 초현실적이고 극적인 이미지를 생성) or natural (모델이 더 자연스럽고 덜 초현실적인 이미지를 생성-dall-e-3 만지원)
    //   user:
    // }

    const response = await openai.images.generate({
      model: model,
      prompt: prompt,
      n: 1,
      size: size,
      style: style,
      response_format: response_format,
    });

    const imgFileName = `sample-${Date.now()}.png`;
    const imgFilePath = `./public/images/${imgFileName}`;

    if (response_format == "url") {
      imageURL = response.data[0].url;

      axios({
        url: imageURL,
        responseType: "stream",
      })
        .then((response) => {
          response.data
            .pipe(fs.createWriteStream(imgFilePath))
            .on("finish", () => {
              console.log("Image saved successfully.");
            })
            .on("error", (err) => {
              console.error("Error saving image:", err);
            });
        })
        .catch((err) => {
          console.error("Error downloading image:", err);
        });
    } else {
      imageBinaryData = response.data[0].b64_json;
      const buffer = Buffer.from(imageBinaryData, "base64");
      fs.writeFileSync(imgFilePath, buffer);
      imageURL = `/images/${imgFileName}`;
    }

    console.log("이미지 생성 URL:", response);
  } catch (err) {
    console.log("OpenAI DALL.E3 API 호출 에러발생:", err);
  }

  res.render("dalle3", { imageURL, imageBinaryData });
});



/*
 * ChatGPT4 기반 AI 챗봇 샘플
 */
router.get("/gpt", async (req, res, next) => {
  res.render('gpt.ejs');
});

module.exports = router;
