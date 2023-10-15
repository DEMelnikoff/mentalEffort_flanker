

const exp = (function() {


    let p = {};

    let settings = {
        hitRates: [[.5, .9], [.9, .5]][Math.floor(Math.random() * 2)],
        adjustment: [0, .4][Math.floor(Math.random() * 2)],
        nTrials: 40,
    };

    settings.hitRates[0] = Math.round((settings.hitRates[0] - settings.adjustment) * 100) / 100;
    settings.hitRates[1] = Math.round((settings.hitRates[1] - settings.adjustment) * 100) / 100;

    if (settings.hitRates[0] < settings.hitRates[1]) {
        settings.effort = ['easy', 'hard'];
    } else {
        settings.effort = ['hard', 'easy'];
    };

    const getArrays = function(settings, round) {

        // shuffle function
        function shuffle(obj1) {
          let index = obj1.length;
          let rnd, tmp1;

          while (index) {
            rnd = Math.floor(Math.random() * index);
            index -= 1;
            tmp1 = obj1[index];
            obj1[index] = obj1[rnd];
            obj1[rnd] = tmp1;
          }
        };

        // get total number of wins and losses
        let nWins = settings.hitRates[round] * settings.nTrials;
        let nLoss = settings.nTrials - nWins;

        // create array of M states
        let winArray = Array(nWins).fill(-1);
        let lossArray = Array(nLoss).fill(1);
        let m_array = winArray.concat(lossArray);

        // shuffle arrays and add back final trial
        shuffle(m_array);

        return m_array;
    };

    const m_array_1 = getArrays(settings, 0);
    const m_array_2 = getArrays(settings, 1);
    const m_array = m_array_1.concat(m_array_2);

    let text = {};

    if (settings.effort[0] == 'hard') {
        text.example_1 = ">><>>";
        text.arrowOrArrows = 'middle arrow';
        text.pointOrPoints = 'points';
        text.exception1 = `<p>For each cue, the middle arrow will always point in the same direction as the other four arrows (e.g., <<<<<).</p>
        <p>Therefore, you no longer have to focus exclusively on the middle arrow. You can simply indicate the direction in which all five arrows are pointing.</p>`;
        text.exception2 = `<p>In the second version of Left or Right, the target scores will be <b>higher</b> than they were in the first version. Therefore, higher scores will be required to complete each round.</p>`;

    } else if (settings.effort[0] == 'easy') {
        text.example_1 = "<<<<<";
        text.arrowOrArrows = 'arrows';
        text.pointOrPoints = 'point';
        text.exception1 = `<p>For each cue, you must indicate the direction of the <b>middle arrow only</b>.</p>
        <p>Sometimes, the middle arrow will point in the same direction as the other arrows (e.g., <<<<<), and other times it will point in the opposite direction (e.g., <<><<). You must indicate the direction of the middle arrow only, regardless of whether it matches the other arrows.</p>`;
        text.exception2 = `<p>In the second version of Left or Right, the target scores will be <b>lower</b> than they were in the first version. Therefore, lower scores will be required win each round.</p>`;
    };

    jsPsych.data.addProperties({
        hitRate_1: settings.hitRates[0],
        hitRate_2: settings.hitRates[1],
        effort_1: settings.effort[0],
        effort_2: settings.effort[1],
    });

   /*
    *
    *   INSTRUCTIONS
    *
    */


    function MakeAttnChk(settings, round) {

        let firstOrSecond;
        (round == 1) ? firstOrSecond = 'first' : firstOrSecond = 'second';

        let correctAnswers_1 = [`10`];
        let correctAnswers_2;

        if (settings.effort[0] == 'easy' && round == 1 || settings.effort[1] == 'easy' && round == 2) {
            correctAnswers_1.push(`For each cue, I must indicate the direction of the arrows.`);
            correctAnswers_2 = [`In the second version of Left or Right, all arrows will point in the same direction.`, `In the second version of Left or Right, the target scores will be higher.`];
        } else if (settings.effort[0] == 'hard' && round == 1 || settings.effort[1] == 'hard' && round == 2) {
            correctAnswers_1.push(`For each cue, I must indicate the direction of the middle arrow only.`);
            correctAnswers_2 = [`In the second version of Left or Right, I must indicate the direction of the middle arrow only.`, `In the second version of Left or Right, the target scores will be lower.`];
        };

        let attnChk;

        if (round == 1) {
            attnChk = {
                type: jsPsychSurveyMultiChoice,
                preamble: `<div class='parent' style='text-align: left; color: rgb(109, 112, 114)'>
                    <p><strong>Please answer the following questions.</strong></p>
                    </div>`,
                questions: [
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>What score is required to win a round?</div>", 
                        name: `attnChk1`, 
                        options: [`5`, `10`, `15`, `20`],
                    },
                    {
                        prompt: `<div style='color: rgb(109, 112, 114)'>Which statement best describes the rules of Left or Right?</div>`, 
                        name: `attnChk2`, 
                        options: [`For each cue, I must indicate the direction of the arrows.`, `For each cue, I must indicate the direction of the middle arrow only.`, `For each cue, I must indicate the color of the arrows.`, `For each cue, I must indicate the number of arrows.`],
                    },
                ],
                scale_width: 500,
                on_finish: (data) => {
                    const totalErrors = dmPsych.getTotalErrors(data, correctAnswers_1);
                    data.totalErrors = totalErrors;
                },
            };
        } else if (round == 2) {
            attnChk = {
                type: jsPsychSurveyMultiChoice,
                preamble: `<div class='parent' style='text-align: left; color: rgb(109, 112, 114)'>
                    <p><strong>Please answer the following questions.</strong></p>
                    </div>`,
                questions: [
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                        name: `attnChk3`, 
                        options: [`In the second version of Left or Right, I must indicate the direction of the middle arrow only.`, `In the second version of Left or Right, all arrows will point in the same direction.`],
                    },
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                        name: `attnChk4`, 
                        options: [`In the second version of Left or Right, the target scores will be lower.`, `In the second version of Left or Right, the target scores will be higher.`],
                    },
                ],
                scale_width: 500,
                on_finish: (data) => {
                    const totalErrors = dmPsych.getTotalErrors(data, correctAnswers_2);
                    data.totalErrors = totalErrors;
                },
            };
        }

        const errorMessage = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>You provided the wrong answer.</p><p>Please continue to try again.</p>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const conditionalNode = {
          timeline: [errorMessage],
          conditional_function: () => {
            const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
            return fail;
          },
        };

        const instLoop = {
          timeline: [attnChk, conditionalNode],
          loop_function: () => {
            const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
            return fail;
          },
        };

        const practiceComplete_1 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>Practice is now complete.</p>
                        <p><b>During Left or Right, your goal is to win as many rounds as possible!</p></p>To win a round, you must score 10 points before time runs out.</b></p>
                        <p>To see what happens when you win a round, proceed to the following page.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you score 10 points before time runs out, you'll see that you won the round:</p>
                        <div class="outcome-container-lose">
                        <div class="your-score">Your Score:<br><br><span style="color:green; font-weight:bold">10</span></div>
                        <div class="trophy"><img src="/mentalEffort-flanker/img/trophy.png" height="250px"></div>
                        </div>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you score less than 10 points when time runs out, you'll see that you lost the round...</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>For example, if you score only 8 points, you'll see:</p>
                        <div class="outcome-container-lose">
                        <div class="your-score">Your Score:<br><br><span style="color:red; font-weight:bold">8</span></div>
                        <div class="flanker-text" style="color:red">You lost!</div>
                        </div>`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const practiceComplete_2 = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>Practice is now complete. Soon, you'll play the second version of the Left or Right.</p>
                        ${text.exception2}`
                    },
                ],
            ],
            button_label_finish: 'Next',
        };

        const readyToPlay = {
            type: jsPsychSurvey,
            pages: [
                [
                    {
                        type: 'html',
                        prompt: `<p>You're now ready to play Left or Right.</p>
                        <p>To begin, continue to the next screen.</p>`
                    },
                ],

            ],
            button_label_finish: 'Next',
        };

        if (round == 1) {
            this.timeline = [practiceComplete_1, instLoop, readyToPlay];
        } else if (round == 2) {
            this.timeline = [practiceComplete_2, instLoop, readyToPlay];
        }
    }


    p.consent = {
        type: jsPsychExternalHtml,
        url: "./html/consent.html",
        cont_btn: "advance",
    };

    p.intro_holeInOne = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p><strong>What makes some activities more immersive and engaging than others?</strong></p>
                    <p>We're interested in why people feel effortlessly engaged in some activities (such as engrossing video games), but struggle to focus on other activities.</p>
                    <p>To help us, you'll play two different games. After each game, you'll report how immersed and engaged you felt.</p>
                    <p>The first game that you'll play is called Hole in One.</p>
                    <p>To learn about and play Hole in One, continue to the next screen.</p></p>`
                },

            ],

        ],
        button_label_finish: 'Next'
    };

    p.intro_1 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p>Hole in One is now complete!</p>
                    <p>Next, you'll play the second of two games. Specifically, you'll play a game called <b>Left or Right</b>.</p>
                    <p>Continue to learn about Left or Right.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>Left or Right takes place over multiple rounds.</p>
                    <p>In each round, you'll see a series of cues composed of five arrows (e.g., ${text.example_1}).</p>
                    For each cue, you must indicate the <b>direction of the ${text.arrowOrArrows}</b>:
                    <ul>
                        <li>If the ${text.arrowOrArrows} ${text.pointOrPoints} left, you must press Q on your keyboard.</li>
                        <li>If the ${text.arrowOrArrows} ${text.pointOrPoints} right, you must press P on your keyboard.</li>
                    </ul>
                    <p>For each correct response you make, your score will increase by one.<br>
                    For instance, if you see ${text.example_1} and press Q, your score will increase by 1.</p>
                    <p>For every error you make, your score will decrease by one.<br>
                    For instance, if you see ${text.example_1} and press P, your score will decrease by 1.</p>`
                },

            ],
            [
                {
                    type: 'html',
                    prompt: `<p>To get a feel for Left or Right, you'll complete multiple practice rounds. During the practice rounds, your goal is to achieve the highest score possible.</p>
                    <p>Continue to start practicing.</p>`,
                }
            ],

        ],
        button_label_finish: 'Next'
    };

    p.intro_2 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p>The first version of Left or Right is now complete!</p>
                    <p>Continue to learn more about the second version.</p>`
                },
            ],
            [
                {
                    type: 'html',
                    prompt: `<p>The second version of Left or Right is identical to the first version with one exception.</p>
                    ${text.exception1}
                    <p>To practice the second version of Left or Right, continue to the next page.</p>`,
                }
            ],
        ],
        button_label_finish: 'Next'    
    };


    const attnChk1 = new MakeAttnChk(settings, 1);

    const attnChk2 = new MakeAttnChk(settings, 2);

    
   /*
    *
    *   TASK
    *
    */


    // temporary variables for flanker task


    let score_feedback;
    let target_score;
    let feedbackText;
    let win;
    let trial = 0;
    let total_wins = 0;

    const MakeTimeline = function(round, isPractice) {


        const fixation = {
            type:jsPsychHtmlKeyboardResponse,
            stimulus: `<div class="outcome-container-lose"><div class="flanker-text" style="font-size:75px; font-weight: normal"><p>+</p></div></div>`,
            choices: "NO_KEYS",
            trial_duration: 500,
        };

        const flanker = {
            type: jsPsychFlanker,
            stimulus: function() {
                let effort = settings.effort[round];
                let outcome = m_array[trial];
                return [effort, outcome];
            },
            response_ends_trial: false,
            trial_duration: 7500,
            choices: ['q', 'p'],
            on_finish: function(data) {
                score_feedback = data.score;
                data.round = round + 1;
                data.practice = isPractice;
            },
        };

        const feedback = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: function() {
                let multiplier, feedbackContent, color;
                if (score_feedback > 1) {
                    multiplier = m_array[trial];
                    win = m_array[trial] == -1;
                } else {
                    multiplier = 1;
                    win = false;
                };
                let delta = Math.floor(Math.random() * 4 + 1) * multiplier;
                target_score = Math.max(1, score_feedback + delta);
                if (multiplier == 1) {
                    color = 'red'
                    feedbackContent = `<div class="flanker-text" style="color:${color}">You lost!</div>`

                } else {
                    color = 'green'; 
                    feedbackContent = `<div class="trophy"><img src="/mentalEffort-flanker/img/trophy.png" height="250px"></div>`
                }
                let html = `<div class="outcome-container-lose">
                <div class="your-score">Your Score:<br><br><span style="color:${color}; font-weight:bold">${score_feedback}</span></div>
                ${feedbackContent}
                </div>`;
                return html;
            },
            choices: "NO_KEYS",
            trial_duration: 2000,
            on_finish: function(data) {
                data.score = score_feedback;
                data.target_score = target_score;
                data.outcome = win;
                trial++;
                data.round = round + 1;
                data.practice = isPractice;
            },
        };

        if (!isPractice) {
            this.timeline = [fixation, flanker, feedback];
            this.repetitions = settings.nTrials;
        } else {
            this.timeline = [fixation, flanker];
            this.repetitions = 4;            
        }


    };

    const flanker_timeline_p1 = new MakeTimeline(0, true);
    const flanker_timeline_p2 = new MakeTimeline(1, true);
    const flanker_timeline_1 = new MakeTimeline(0, false);
    const flanker_timeline_2 = new MakeTimeline(1, false);


   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    const zeroToExtremely = ["0<br>A little", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>Extremely"];
    const zeroToALot = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>A lot'];

    // constructor functions
    function MakeFlowQs(game) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>
        <p>Thank you for completing ${game}!</p>
        <p>During ${game}, to what extent did you feel <b>immersed</b> and <b>engaged</b> in what you were doing?</p>
        <p>Report the degree to which you felt immersed and engaged by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During ${game}, how <strong>absorbed</strong> did you feel in what you were doing?</div>`,
                name: `absorbed`,
                labels: ["0<br>Not very absorbed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More absorbed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During ${game}, how <strong>immersed</strong> did you feel in what you were doing?</div>`,
                name: `immersed`,
                labels: ["0<br>Not very immersed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More immersed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During ${game}, how <strong>engaged</strong> did you feel in what you were doing?</div>`,
                name: `engaged`,
                labels: ["0<br>Not very engaged", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engaged than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During ${game}, how <strong>engrossed</strong> did you feel in what you were doing?</div>`,
                name: `engrossed`,
                labels: ["0<br>Not very engrossed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engrossed than I've ever felt"],
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {game: game};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEnjoyQs(game) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Below are a few more questions about ${game}.</p>

        <p>Instead of asking about immersion and engagement, these questions ask about <strong>enjoyment</strong>.<br>
        Report how much you <strong>enjoyed</strong> ${game} by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>enjoy</strong> playing ${game}?</div>`,
                name: `enjoyable`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>like</strong> playing ${game}?</div>`,
                name: `like`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>dislike</strong> playing ${game}?</div>`,
                name: `dislike`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much <strong>fun</strong> did you have playing ${game}?</div>`,
                name: `fun`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <strong>entertaining</strong> was ${game}?</div>`,
                name: `entertaining`,
                labels: zeroToExtremely,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {game: game};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEffortQs(game) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>effortful</b> was ${game}?</div>`,
                name: `effort`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {game: game};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };


    const holeInOne = {
        type: dmPsychHoleInOne,
        stimulus: dmPsych.holeInOne.run,
        total_shots: 12,  
        canvas_size: [475, 900],
        ball_color: 'white',
        ball_size: 10,
        ball_xPos: .13,
        ball_yPos: .5,
        wall_width: 75,
        wall_color: '#797D7F',
        wall_xPos: .9,
        hole_size: 75,
        friction: .02,
        tension: .01,
        prompt: `<div class='instructions'>

        <p><strong>Hole in One</strong>. The goal of Hole in One is to shoot the ball through the hole.<br>
        Follow the instructions in the game area, then play Hole in One. 
        We'll let you know when time is up.</p></div>`,
        data: {game: 'holeInOne'}
    };

    // timeline: first wheel
    p.holeInOne_timeline = {
        timeline: [holeInOne, new MakeFlowQs('Hole in One'), new MakeEnjoyQs('Hole in One'), new MakeEffortQs('Hole in One')],
    };

    // timeline: second wheel
    p.leftOrRight_timeline = {
        timeline: [flanker_timeline_p1, attnChk1, flanker_timeline_1, new MakeFlowQs('Left or Right'), new MakeEnjoyQs('Left or Right'), new MakeEffortQs('Left or Right')],
    };

   /*
    *
    *   Demographics
    *
    */

    p.demographics = (function() {


        const taskComplete = {
            type: jsPsychInstructions,
            pages: [`<div class='parent' style='color: rgb(109, 112, 114)'>
                    <p>Both games are now complete!</p>
                    <p>To finish this study, please continue to answer a few final questions.</p>
                    </div>`],
            show_clickable_nav: true,
            post_trial_gap: 500,
            allow_keys: false,
        };

        const meanOfEffScale = ['-2<br>Strongly<br>Disagree', '-1<br>Disagree', '0<br>Neither agree<br>nor disagree', '1<br>Agree', '2<br>Strongly<br>Agree'];

        const meanOfEff = {
            type: jsPsychSurveyLikert,
            preamble:
                `<div style='padding-top: 50px; width: 900px; font-size:16px; color: rgb(109, 112, 114)'>
                    <p><strong>Please answer the following questions as honestly and accurately as possible.</strong></p>
                </div>`,
            questions: [
                {
                    prompt: `Pushing myself helps me see the bigger picture.`,
                    name: `meanOfEff_1`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `I often don't understand why I am working so hard.`,
                    name: `meanOfEff_2r`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `I learn the most about myself when I am trying my hardest.`,
                    name: `meanOfEff_3`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `Things make more sense when I can put my all into them.`,
                    name: `meanOfEff_4`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I work hard, it rarely makes a difference.`,
                    name: `meanOfEff_5r`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I push myself, what I'm doing feels important.`,
                    name: `meanOfEff_6`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I push myself, I feel like I'm part of something bigger than me.`,
                    name: `meanOfEff_7`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `Doing my best gives me a clear purpose in life.`,
                    name: `meanOfEff_8`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I try my hardest, my life has meaning.`,
                    name: `meanOfEff_9`,
                    labels: meanOfEffScale,
                    required: true,
                },
                {
                    prompt: `When I exert myself, I feel connected to my ideal life.`,
                    name: `meanOfEff_10`,
                    labels: meanOfEffScale,
                    required: true,
                },
            ],
            randomize_question_order: false,
            scale_width: 500,
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        };

        const gender = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>What is your gender?</p>',
            choices: ['Male', 'Female', 'Other'],
            on_finish: (data) => {
                data.gender = data.response;
            }
        };

        const age = {
            type: jsPsychSurveyText,
            questions: [
                {
                    prompt: "Age:", 
                    name: "age",
                    required: true,
                }
            ],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 

        const ethnicity = {
            type: jsPsychSurveyHtmlForm,
            preamble: '<p>What is your race / ethnicity?</p>',
            html: `<div style="text-align: left">
            <p>White / Caucasian <input name="ethnicity" type="radio" value="white"/></p>
            <p>Black / African American <input name="ethnicity" type="radio" value="black"/></p>
            <p>East Asian (e.g., Chinese, Korean, Vietnamese, etc.) <input name="ethnicity" type="radio" value="east-asian"/></p>
            <p>South Asian (e.g., Indian, Pakistani, Sri Lankan, etc.) <input name="ethnicity" type="radio" value="south-asian"/></p>
            <p>Latino / Hispanic <input name="ethnicity" type="radio" value="hispanic"/></p>
            <p>Middle Eastern / North African <input name="ethnicity" type="radio" value="middle-eastern"/></p>
            <p>Indigenous / First Nations <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Bi-racial <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Other <input name="other" type="text"/></p>
            </div>`,
            on_finish: (data) => {
                data.ethnicity = data.response.ethnicity;
                data.other = data.response.other;
            }
        };

        const english = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>Is English your native language?:</p>',
            choices: ['Yes', 'No'],
            on_finish: (data) => {
                data.english = data.response;
            }
        };  

        const finalWord = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Questions? Comments? Complains? Provide your feedback here!", rows: 10, columns: 100, name: "finalWord"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 


        const demos = {
            timeline: [taskComplete, gender, age, ethnicity, english, finalWord]
        };

        return demos;

    }());


   /*
    *
    *   SAVE DATA
    *
    */

    p.save_data = {
        type: jsPsychPipe,
        action: "save",
        experiment_id: "NiNMyKS2vTTK",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.intro_holeInOne, exp.holeInOne_timeline, exp.intro_1, exp.leftOrRight_timeline, exp.demographics, exp.save_data];

jsPsych.run(timeline);
