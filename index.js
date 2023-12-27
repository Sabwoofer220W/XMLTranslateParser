import { XMLParser,XMLBuilder } from 'fast-xml-parser';
import { readFileSync,writeFileSync,readdirSync } from 'fs';
import { translate } from '@vitalets/google-translate-api';





//Функция для получение массива имен файлов которые нужно перевести
async function GetArrFile(testFolder) {
   
      const res = await new Promise(

        async (resolve) => {
        
            let files = [];
            readdirSync(testFolder).forEach((file) => {
                files.push(file);
              });

            resolve(files);
        }

    );

    return res;

}


//=========================================================
//Функция для вывода содержимого английских субтитров в файле
function PrintAllText(cut) {
    console.log(`=======================Найденный текст===========================`);
    let count = 0;
    for (let i = 0; i < cut.length; i++) {
       
        if (cut[i].caption !== undefined) {
            if (cut[i].caption.length === undefined) {
                console.log(cut[i].caption.textSub);
            }else {
                for (let j = 0; j < cut[i].caption.length; j++) {
                    console.log(cut[i].caption[j].textSub);
                }
        }
    
    }
    count = count + 1;
    }
    console.log("Кол-во фраз:"+(count-1));
    console.log(`==================================================================`);
}
// Тест Api переводчика 
async function TestTranslate(){
    
        await Ftranslate(Math.random() * 5000,"Hello Word").then(result => {
        console.log(result.text);
          }
          );
        
}

//=========================================================
// Функция дяля обращения к api google
      const Ftranslate = (ms,text) => {
      
       return new Promise(

            async (resolve) => {
            
                const Translatetext = await translate(text, { to: 'ru' });
                 setTimeout(() => { console.log(Translatetext);resolve(Translatetext)}, ms);
           
            }

        );

    };

//Перевод Субтитров
      async function RunTranslateTextSub(cut) {
        try {
        for (let i = 0; i < cut.length; i++) {
            if (cut[i].caption !== undefined) {
        
                if (cut[i].caption.length === undefined) {
                    if(cut[i].caption.textSub != '') {
                    await Ftranslate(60000,cut[i].caption.textSub).then(
                        result => { cut[i].caption.text = result.text}
                    );
                    }
                      
                } else {
                    for (let j = 0; j < cut[i].caption.length; j++) {
                        if(cut[i].caption[j].textSub != '') {
                        await Ftranslate(60000,cut[i].caption[j].textSub).then(
                            result => {cut[i].caption[j].text = result.text;}
                        );
                        }

                    }
 
                }
        
            }
        }
    } catch(e) {
        console.log(e);
    }

      }
//Перевод вариантов ответов
      async function RunTranslateBtn(cut) {

        for (let i = 0; i < cut.length; i++) {
           
            if (cut[i].btn !== undefined) {
        
                if (cut[i].btn.length === undefined) {
                    if (cut[i].btn.TextSub !== undefined) {
                        if(cut[i].btn.TextSub != '') {
                        await Ftranslate(60000,cut[i].btn.TextSub).then(
                            result => { cut[i].btn.Text = result.text}
                        );
                        }
                    }

                } else {
                    
                    for (let j = 0; j < cut[i].btn.length; j++) {
                        if (cut[i].btn[j].TextSub !== undefined) {
                            if(cut[i].btn[j].TextSub != '') {
                            await Ftranslate(60000,cut[i].btn[j].TextSub).then(
                            result => {cut[i].btn[j].Text = result.text;}
                         );
                            }
                        }
                    }
                
 
                }
        
            }

        }

      }

//======================================================

async function processArray(array) {
    for (const item of array) {
        try {
        console.log(`=======================Начинаем перевод файла ${item}===========================`);
    const xmlFile = readFileSync(`${process.cwd()}\\translate\\${item}`, 'utf8');

        const parser = new XMLParser();
        var json = await parser.parse(xmlFile);

        var cut = await json.data.cut;

         PrintAllText(cut);
         await RunTranslateTextSub(cut);

        console.log('=======================Перевод текста окончен===========================');
        console.log('Начинаю перевод кнопок ========>');
        await RunTranslateBtn(cut);
        console.log(`=======================Перевод файла ${item} окончен===========================`);

      const builder =  new XMLBuilder();
      const xmlContent = await builder.build(json);
      
        writeFileSync(".\\translated\\"+item, xmlContent);

        console.log(`Файл ${item} переведен!`);
        } catch(e) {
            const builder =  new XMLBuilder();
            const xmlContent = await builder.build(json);
            console.log(json);
            writeFileSync(".\\translated\\"+item, xmlContent);
            console.log(e);
        }
    }
  }


(async function BuildXML() { 
    try {

 
   let files = [];
    await GetArrFile(`${process.cwd()}/translate/`).then( async (result) => { 
        files = await result;
    });

    
    await processArray(files);


    } catch(e) {
        console.log(e);
    }
})();


  

