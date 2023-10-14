

const exp = (function() {


    let p = {};

    let settings = {
        hitRates: [[.5, .8], [.8, .5]][Math.floor(Math.random() * 2)],
        adjustment: [0, .3][Math.floor(Math.random() * 2)],
        nTrials: 40,
    };

    settings.hitRates[0] = Math.round((settings.hitRates[0] - settings.adjustment) * 100) / 100;
    settings.hitRates[1] = Math.round((settings.hitRates[1] - settings.adjustment) * 100) / 100;

    if (settings.hitRates[0] < settings.hitRates[1]) {
        settings.effort = ['easy', 'hard'];
    } else {
        settings.effort = ['hard', 'easy'];
    };

    console.log(settings.hitRates[0]);

    const getArrays = function(settings, round) {

        // shuffle function
        function shuffle(obj1, obj2) {
          let index = obj1.length;
          let rnd, tmp1, tmp2;

          while (index) {
            rnd = Math.floor(Math.random() * index);
            index -= 1;
            tmp1 = obj1[index];
            tmp2 = obj2[index];
            obj1[index] = obj1[rnd];
            obj2[index] = obj2[rnd];
            obj1[rnd] = tmp1;
            obj2[rnd] = tmp2;
          }
        };

        // get total number of wins and losses
        let nWins = settings.hitRates[round] * settings.nTrials;
        let nLoss = settings.nTrials - nWins;

        // create array of M states
        let winArray = Array(nWins).fill(-1);
        let lossArray = Array(nLoss).fill(1);
        let m_array = winArray.concat(lossArray);
        let m_array_last = m_array.pop(); // remove last element to ensure a loss on the final trial

        // create array of E states
        let winArray_reward = Array( (3 * nWins) / 4  ).fill('reward');
        let winArray_noReward = Array( nWins / 4 ).fill('no_reward');
        let lossArray_reward = Array( nLoss / 4 ).fill('reward');
        let lossArray_noReward = Array( (3 * nLoss) / 4 ).fill('no_reward');
        let e_array = winArray_reward.concat(winArray_noReward, lossArray_reward, lossArray_noReward);
        let e_array_last = e_array.pop(); // remove last element to ensure no reward on final trial

        // shuffle arrays and add back final trial
        shuffle(m_array, e_array);
        m_array.push(m_array_last);
        e_array.push(e_array_last);

        return [m_array, e_array];
    };

    const [m_array_1, e_array_1] = getArrays(settings, 0);
    const [m_array_2, e_array_2] = getArrays(settings, 1);
    const m_array = m_array_1.concat(m_array_2);
    const e_array = e_array_1.concat(e_array_2);

    let nCongruent = 0;
    for (let i = 0; i < m_array_1.length; i++) {
        if (m_array[i] == -1 && e_array[i] == "reward" || m_array[i] == 1 && e_array[i] == "no_reward") {
            nCongruent++;
        }
    };

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

        let correctAnswers_1 = [`A score equal to or greater than the target score (which is not revealed until the end of the round)`, `75%`, `25%`];
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
                        options: [`A score of 10`, `A score of 30`, `A score equal to or greater than the target score (which is not revealed until the end of the round)`, `A score exactly equal to the target score (which is not revealed until the end of the round)`],
                    },
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>If you complete a round, what are your chances of receiving a 5-cent bonus?</div>", 
                        name: `attnChk2`, 
                        options: [`25%`, `50%`, `75%`, `100%`],
                    },
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>If you fail to complete a round, what are your chances of receiving a 5-cent bonus?</div>", 
                        name: `attnChk3`, 
                        options: [`25%`, `50%`, `75%`, `100%`],
                    },
                    {
                        prompt: `<div style='color: rgb(109, 112, 114)'>Which statement best describes the rules of the ${firstOrSecond} version of Left or Right?</div>`, 
                        name: `attnChk4`, 
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
                        name: `attnChk4`, 
                        options: [`In the second version of Left or Right, I must indicate the direction of the middle arrow only.`, `In the second version of Left or Right, all arrows will point in the same direction.`],
                    },
                    {
                        prompt: "<div style='color: rgb(109, 112, 114)'>Which of the following statements is true?</div>", 
                        name: `attnChk2`, 
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
                        prompt: `<p>Practice is now complete. Soon, you'll complete the first version of Left or Right.</p>
                        <p><b>During the first version of Left or Right, you'll be able to earn bonus money!</b></p>
                        <p>To learn how to win bonus money, continue to the next screen.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>During the first version of Left or Right, each round will have a different <b>target score</b>. 
                        If you reach the target score before time runs out, that round will be marked as "complete."</p>
                        <p>For example, if the target score is 20, you need a score of 20 or more to complete the round.</p>
                        <p>The target score is not revealed until the end of each round.</p>
                        <ul>
                            <li>Completing a round gives you a <b>75%</b> chance of earning a 5-cent bonus.</li>
                            <li>Failing to complete a round gives you a <b>25%</b> chance of earning a 5-cent bonus.</li>
                        </ul>
                        <p>For an illustration of how to earn bonus money, proceed to the following pages.</p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you score <b>18</b> and the target score is <b>20</b>, you'll see:</p>
                        <p style="text-align:center; font-size: 35px; color: black"><b>You missed the target score</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Your Score: <b>18</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Target Score: <b>20</b></p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>Missing the target score give you a <b>25%</b> chance of receiving a 5-cent bonus.</p>
                        <p style="text-align:center; font-size: 35px; color: black"><b>You missed the target score</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Your Score: <b>18</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Target Score: <b>20</b></p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>If you score <b>22</b> and the target score is <b>20</b>, you'll see:</p>
                        <p style="text-align:center; font-size: 35px; color: red"><b>You reached the target score</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Your Score: <b>22</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Target Score: <b>20</b></p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<p>Reaching the target score gives you a <b>75%</b> chance of receiving a 5-cent bonus.</p>
                        <p style="text-align:center; font-size: 35px; color: red"><b>You reached the target score</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Your Score: <b>22</b></p>
                        <p style="text-align:center; font-size: 35px; color: black">Target Score: <b>20</b></p>`
                    },
                ],
                [
                    {
                        type: 'html',
                        prompt: `<div style="width:800px; text-align:center"><p>If you receive a 5-cent bonus you'll see:</p></div>
                            <img style="display: block; margin-left: auto; margin-right: auto" src="/mentalEffort_flanker/img/coins.jpg">
                            <div class="outcome-text" style="text-align: center; color: #85BB65; font-weight: bold; text-shadow: -1px 1px 2px #000, 1px 1px 2px #000, 1px -1px 0 #000, -1px -1px 0 #000">
                                <span style="font-size: 95px; line-height:90px">+5</span>
                            </div>`
                    },
                ],

                [
                    {
                        type: 'html',
                        prompt: `<div style="width:800px; text-align:center"><p>If you don't receive a 5-cent bonus, you'll see:</p></div>
                            <div style="height:200px"></div>
                            <div class="outcome-text" style="text-align: center; color: black; font-weight: bold">
                                <span style="font-size: 95px; line-height:90px">+0</span>
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
                        prompt: `<p>You're now ready to play the ${firstOrSecond} version of Left or Right.</p>
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

    p.intro_1 = {
        type: jsPsychSurvey,
        pages: [
            [
                {
                    type: 'html',
                    prompt: `<p><strong>What makes some activities more immersive and engaging than others?</strong></p>
                    <p>We're interested in why people feel effortlessly engaged in some activities (such as engrossing video games), but struggle to focus on other activities (like tedious chores).</p>
                    <p>To help us, you'll complete two different versions of a game called <strong>Left or Right</strong>. After each version, you'll report how immersed and engaged you felt.</p>
                    <p>When you're ready to learn about the first version of Left or Right, continue to the next page.</p>`
                },

            ],
            [
                {
                    type: 'html',
                    prompt: `<p>The first version of Left or Right takes place over multiple rounds.</p>
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
                    prompt: `<p>To get a feel for the first version of Left or Right, you'll complete multiple practice rounds. During the practice rounds, your goal is to achieve the highest score possible.</p>
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
    let win;
    let trial = 0;
    let total_wins = 0;

    const MakeTimeline = function(round, isPractice) {


        const fixation = {
            type:jsPsychHtmlKeyboardResponse,
            stimulus: `<div class="outcome-container-lose"><div class="outcome-text" style="font-size:75px; font-weight: normal"><p>+</p></div></div>`,
            choices: "NO_KEYS",
            trial_duration: 500,
        };

        const flanker = {
            type: jsPsychFlanker,
            stimulus: settings.effort[round],
            response_ends_trial: false,
            trial_duration: 3500,
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
                let multiplier, feedbackText;
                if (score_feedback > 1) {
                    multiplier = m_array[trial];
                    win = e_array[trial] == "reward";
                } else {
                    multiplier = 1;
                    win = false;
                };
                let delta = Math.floor(Math.random() * 4 + 1) * multiplier;
                target_score = Math.max(1, score_feedback + delta);
                if (multiplier == 1) {
                    feedbackText = `<p style="text-align:center; font-size: 35px; color: black"><b>You missed the target score</b></p>`
                } else {
                    feedbackText = `<p style="text-align:center; font-size: 35px; color: red"><b>You reached the target score</b></p>`
                }
                let html = `<div class="flanker-container">
                    ${feedbackText}
                    <div class="feedback-text">
                    <p>Your Score: <strong>${score_feedback}</strong></p>
                    <p>Target Score: <strong>${target_score}</strong></p>
                    </div></div>`;
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

        const outcome = {
            type:jsPsychHtmlKeyboardResponse,
            stimulus: function() {

                if (win) {
                    html = `<div class="outcome-container-win">
                                <img src="/mentalEffort_flanker/img/coins.jpg">
                                <div class="outcome-text">
                                    <span style="font-size: 95px; line-height:90px">+5</span>
                                </div>                            
                            </div>`
                } else {
                    html = `<div class="outcome-container-lose">
                                <div class="outcome-text">
                                    <span style="font-size: 95px; line-height:90px">+0</span>
                                </div>
                            </div>`
                };
                return html;
            },
            choices: "NO_KEYS",
            trial_duration: 2000,
            on_finish: function(data) {
                data.round = round + 1;
                data.practice = isPractice;
            },
        };

        if (!isPractice) {
            this.timeline = [fixation, flanker, feedback, outcome];
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
    function MakeFlowQs(round, firstOrSecond) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>
        <p>Thank you for completing the ${firstOrSecond} version of Left or Right!</p>
        <p>During the ${firstOrSecond} version of Left or Right, to what extent did you feel<br><b>immersed</b> and <b>engaged</b> in what you were doing?</p>
        <p>Report the degree to which you felt immersed and engaged by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During the ${firstOrSecond} version of Left or Right, how <strong>absorbed</strong> did you feel in what you were doing?</div>`,
                name: `absorbed`,
                labels: ["0<br>Not very absorbed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More absorbed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During the ${firstOrSecond} version of Left or Right, how <strong>immersed</strong> did you feel in what you were doing?</div>`,
                name: `immersed`,
                labels: ["0<br>Not very immersed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More immersed than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During the ${firstOrSecond} version of Left or Right, how <strong>engaged</strong> did you feel in what you were doing?</div>`,
                name: `engaged`,
                labels: ["0<br>Not very engaged", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engaged than I've ever felt"],
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>During the ${firstOrSecond} version of Left or Right, how <strong>engrossed</strong> did you feel in what you were doing?</div>`,
                name: `engrossed`,
                labels: ["0<br>Not very engrossed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engrossed than I've ever felt"],
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEnjoyQs(round, firstOrSecond) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px; color:rgb(109, 112, 114)'>

        <p>Below are a few more questions about the ${firstOrSecond} version of Left or Right.</p>

        <p>Instead of asking about immersion and engagement, these questions ask about <strong>enjoyment</strong>.<br>
        Report how much you <strong>enjoyed</strong> the ${firstOrSecond} version of Left or Right by answering the following questions.</p></div>`;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>enjoy</strong> playing the ${firstOrSecond} version of Left or Right?</div>`,
                name: `enjoyable`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>like</strong> playing the ${firstOrSecond} version of Left or Right?</div>`,
                name: `like`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much did you <strong>dislike</strong> playing the ${firstOrSecond} version of Left or Right?</div>`,
                name: `dislike`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How much <strong>fun</strong> did you have playing the ${firstOrSecond} version of Left or Right?</div>`,
                name: `fun`,
                labels: zeroToALot,
                required: true,
            },
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <strong>entertaining</strong> was the ${firstOrSecond} version of Left or Right?</div>`,
                name: `entertaining`,
                labels: zeroToExtremely,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    function MakeEffortQs(round, firstOrSecond) {
        this.type = jsPsychSurveyLikert;
        this.questions = [
            {
                prompt: `<div style='color:rgb(109, 112, 114)'>How <b>effortful</b> was the ${firstOrSecond} version of Left or Right?</div>`,
                name: `effort`,
                labels: zeroToALot,
                required: true,
            },
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);      
        };
    };


    // timeline: first wheel
    p.wheel_1 = {
        timeline: [flanker_timeline_p1, attnChk1, flanker_timeline_1, new MakeFlowQs(1, 'first'), new MakeEnjoyQs(1, 'first'), new MakeEffortQs(1, 'first')],
    };

    // timeline: second wheel
    p.wheel_2 = {
        timeline: [flanker_timeline_p2, attnChk2, flanker_timeline_2, new MakeFlowQs(2, 'second'), new MakeEnjoyQs(2, 'second'), new MakeEffortQs(2, 'second')],
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
                    <p>Both version of Left or Right are now complete!</p>
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
        experiment_id: "lu7SGvkuJJvU",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.intro_1, exp.wheel_1, exp.intro_2, exp.wheel_2, exp.demographics, exp.save_data];

jsPsych.run(timeline);
