import { dscc } from '@google/dscc';
import * as d3 from 'd3';

const HF_MODEL = 'deepset/roberta-base-squad2';

const style = document.createElement('style');
document.head.appendChild(style);

const drawViz = (data) => {
    const container = d3.select('body');
    container.selectAll('*').remove();

    const userInput = data.style.userInput;
    const HF_API_KEY = data.style.hfApiKey;

    let dataToSummarize = "";
    if (data.tables && data.tables.DEFAULT) {
        data.tables.DEFAULT.forEach(row => {
            row.forEach(cell => {
                dataToSummarize += cell.value + " ";
            });
            dataToSummarize += "\n";
        });
    }

    const prompt = `Answer the question based on the following data: ${dataToSummarize}. Question: ${userInput}`;

    const payload = {
        inputs: {
            question: userInput,
            context: dataToSummarize
        }
    };

    const options = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };

    fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, options)
        .then((response) => response.json())
        .then((json) => {
            if (json && json.answer) {
                container.append('p').text(json.answer);
            } else {
                container.append('p').text('No answer found.');
            }
        })
        .catch((error) => {
            console.error(error);
            container.append('p').text('Error generating answer.');
        });
};

dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });