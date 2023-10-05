var lang = require("./lang.js");
var spark = require("./spark.js");

function supportLanguages() {
  return lang.supportedLanguages.map(([standardLang]) => standardLang);
}

function translate(query, completion) {
  const socket = spark.createSocket();
  const promt = "现在你是一个翻译器，把冒号后的文本进行翻译，如果是中文翻译成英文，如果是其他语言则翻译成中文，仅包含翻译后的文本： ";

  const requestObject = {
    header: {
      app_id: $option.APPID,
    },
    parameter: {
      chat: {
        domain: "generalv2",
      },
    },
    payload: {
      message: {
        text: [
          {
            role: "user",
            content: promt + query.text,
          },
        ],
      },
    },
  };
  socket.listenOpen(function (socket) {
    $log.info(`did open`);
    socket.sendString(JSON.stringify(requestObject));
  });
  var receiveString = "";
  socket.listenReceiveString(function (socket, string) {
    $log.info(`did receive string: ${string}`);
    const currentMessage = JSON.parse(string).payload.choices.text[0].content;
    const isLastMessage = JSON.parse(string).payload.choices.status === 2;
    receiveString += currentMessage;
    const result = {
      toParagraphs: [receiveString],
    };
    if (isLastMessage) {
      query.onCompletion({ result: result });
      socket.close();
    } else {
      query.onStream({ result: result });
    }
  });
}
