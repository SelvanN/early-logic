/*
 * Hash  v0.6.9
 * Copyright 2023 HashHackCode, LLP.
 */

function Hash(config) {
    this.config = config;
    this.clickedDotsSequence = []; 
    this.worksheetResults = {};
    this.init();
}

Hash.prototype.init = function() {
    var _this = this;
    var lastClickedRef = null;
    var lastClickedRefTileClass = null;
    var lastClickedRefTileColorClass = null;
    var lastClickedRefOptionClass = null;
    var lastDotIndex = 0;

    $(document).ready(function() {
    // Initialize worksheet results object
    $('section.worksheet').each(function() {
        var classList = $(this).attr('class').split(' ');
        var worksheetId = classList.find(function(className) {
            return /^w\d+$/.test(className);
        });
       
        if (!worksheetId) {
            console.error("No worksheet ID found for element:", this);
            return; // Skip this worksheet
        }
        
        _this.worksheetResults[worksheetId] = {
            questions: {},
            correctAnswers: 0,
            incorrectAnswers: 0
        };
    });

        $('.ans-select, .ans-image, .ans-fill').click(function() {
            $(this).siblings().removeClass('selected').end().addClass('selected');
        });

        $('.ans-ref').click(function() {
            var questionType = $(this).closest('.question').data('question');
        
            switch (questionType) {
                case 'match':
                    var clickedRefClass = $(this).attr('class').split(' ').find(c => c.startsWith('match-'));
                    $('.ans-match.' + clickedRefClass).removeClass(clickedRefClass).removeClass('selected');
                    lastClickedRefClass = clickedRefClass;
                    lastClickedRef = $(this);
                    $(this).addClass('selected');
                    break;

                    case 'tiles':
                        lastClickedRef = $(this);
                        lastClickedRefTileClass = $(this).attr('class').split(' ').find(c => c.startsWith('tile-'));
                        lastClickedRefTileColorClass = $(this).attr('class').split(' ').find(c => c.startsWith('tileColor-'));                    
                        break;
                    case 'options':
                        lastClickedRef = $(this);
                        lastClickedRefOptionClass = $(this).attr('class').split(' ').find(c => c.startsWith('option-'));
                        break;
        
                // ... other cases for different question types ...
            }
        });
        $('.ans-tiles').click(function() {
            var currentTileClass = $(this).attr('class').split(' ').find(c => c.startsWith('tile-'));
            var currentTileColorClass = $(this).attr('class').split(' ').find(c => c.startsWith('tileColor-'));
        
            if ($(this).hasClass('selected')) {
                // Deselect and remove the current tile classes
                $(this).removeClass('selected').removeClass(currentTileClass).removeClass(currentTileColorClass);
                // Show only the specific ans-ref that corresponds to the deselected ans-tiles
                $('.ans-ref.' + currentTileClass).show();
            } else if (lastClickedRef) {
                // Remove the lastClickedRefTileClass and lastClickedRefTileColorClass from the ans-tiles that are being deselected
                $('.ans-tiles.selected.' + lastClickedRefTileClass).removeClass('selected').removeClass(lastClickedRefTileClass).removeClass(lastClickedRefTileColorClass);
                // Add the classes from the last clicked ans-ref and hide it
                $(this).addClass(lastClickedRefTileClass).addClass(lastClickedRefTileColorClass).addClass('selected');
                lastClickedRef.hide();
                lastClickedRef = null;
                lastClickedRefTileClass = null;
                lastClickedRefTileColorClass = null;
            }
        });
        $('.ans-options').click(function() {
            if (lastClickedRef) {
                // Remove the existing option-* class
                var currentOptionClass = $(this).attr('class').split(' ').find(c => c.startsWith('option-'));
                if (currentOptionClass) {
                    $(this).removeClass(currentOptionClass);
                }
                // Add the class from the last clicked ans-ref
                $(this).addClass(lastClickedRefOptionClass);
                lastClickedRef = null;
                lastClickedRefOptionClass = null;
            }
        });
        
        $('.ans-match').click(function() {
            var $this = $(this); // Cache jQuery object
            if (lastClickedRefClass) {
                $('.ans-match.selected.' + lastClickedRefClass).removeClass('selected');
            }
            if (lastClickedRef && lastClickedRefClass) {
                var previousMatchClass = $this.data('previousMatchClass');
                var isChangingMatch = previousMatchClass && previousMatchClass !== lastClickedRefClass;
                if (previousMatchClass) {
                    $('.ans-match.' + previousMatchClass).removeClass(previousMatchClass);
                    if (isChangingMatch) {
                        $('.ans-ref.' + previousMatchClass).removeClass('selected');
                    }
                }
                $this.removeClass(function(index, className) {
                    return (className.match(/\bmatch-\S+/g) || []).join(' ');
                }).addClass(lastClickedRefClass).data('previousMatchClass', lastClickedRefClass).addClass('selected');
            }
        });
       // Get the parent container
var container = $('.svg-dots')[0];

// Create SVG element
var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", "100%");
svg.setAttribute("height", "100%");
svg.style.position = "absolute"; // Make the SVG overlay the container
svg.style.top = 0;
svg.style.left = 0;
svg.style.zIndex = 1; // Ensure the SVG is above the other elements in the container
svg.style.pointerEvents = "none"; // Ignore pointer events

// Append the SVG to the container instead of the body
// container.appendChild(svg);

// Create polyline for the SVG
var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
polyline.setAttribute("stroke", "black");
polyline.setAttribute("fill", "transparent");
svg.appendChild(polyline);
$('.ans-dots').click(function() {
    var dotValue = $(this).data('dots').toString();
    
    // If the dot is already selected and is the last in the sequence, deselect it
    if ($(this).hasClass('selected') && _this.clickedDotsSequence[_this.clickedDotsSequence.length - 1] === dotValue) {
        _this.clickedDotsSequence.pop();
        lastDotIndex--; // Decrement lastDotIndex since we're removing the last dot
        $(this).removeClass('selected dot-' + (lastDotIndex + 1)); // Adjust for 0-based indexing

        // Remove last point from polyline
        var points = polyline.getAttribute("points").split(" ");
        points.pop();
        polyline.setAttribute("points", points.join(" "));
    } else if (!$(this).hasClass('selected')) {
        _this.clickedDotsSequence.push(dotValue);
        lastDotIndex++; // Increment lastDotIndex since we're adding a new dot
        $(this).addClass('selected dot-' + lastDotIndex); // Apply dot index class

        // Add new point to polyline
        var offset = $(this).offset();
        var containerOffset = $(container).offset();
        var pointX = offset.left - containerOffset.left + $(this).width() / 2;
        var pointY = offset.top - containerOffset.top + $(this).height() / 2;
        var point = pointX + "," + pointY;
        var points = polyline.getAttribute("points");
        polyline.setAttribute("points", points ? points + " " + point : point);

        // Add a circle at this point
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pointX);
        circle.setAttribute("cy", pointY);
        circle.setAttribute("r", 5); // Radius of the circle
        circle.setAttribute("fill", "black"); // Color of the circle
        svg.appendChild(circle);
    }
});

        $('#submit').click(function() {
            _this.checkAnswers();
        });
    });
};


Hash.prototype.checkAnswers = function() {
    var _this = this;

      
    $('.worksheet').each(function() {
        var classList = $(this).attr('class').split(' ');
        var worksheetId = classList.find(function(className) {
            return /^w\d+$/.test(className);
        });

        if (!_this.worksheetResults[worksheetId]) {
            console.error("Worksheet ID not found in worksheetResults:", worksheetId);
            return; // Skip this iteration
        }

        var totalQuestionsInWorksheet = $(this).find('.question').length;
        _this.worksheetResults[worksheetId].totalQuestions = totalQuestionsInWorksheet;


        $(this).find('.question').each(function() {
            var classList = $(this).attr('class').split(' ');
            var questionId = classList.find(function(className) {
                return /^q\d+$/.test(className);
            });
            if (!questionId) {
                console.error("No question ID found for element:", this);
                return; // Skip this question if no ID found
            } 
            var questionType = $(this).data('question');
            var isCorrect = false;
            var allMatchesCorrect = true;
            var totalMatches = 0;
            var correctMatchAnswers = 0;
            
            // Declare correctAnswer variable
            var correctAnswer = ''; // Default value

            if (questionType !== 'match') {
                correctAnswer = $(this).find('.answer').data('answer') ? $(this).find('.answer').data('answer').toString().toLowerCase() : "";
            }

            switch (questionType) {
                case 'select':
            case 'image':
                var userAnswer = $(this).find('.selected').text().toLowerCase().trim() || $(this).find('.selected').attr('alt');
                isCorrect = userAnswer === correctAnswer;
                break;
        
            case 'fill':
                userAnswer = $(this).find('.ans-fill').text().toLowerCase().trim();
                isCorrect = userAnswer === correctAnswer;
                break;

            case 'match':
                totalMatches = $(this).find('.ans-ref').length;
                $(this).find('.ans-ref').each(function() {
                    var refMatchClass = $(this).attr('class').split(' ').find(c => c.startsWith('match-'));
                    var refMatchValue = $(this).data('match');
                    var matchedElement = $('.ans-match.' + refMatchClass);

                    if (matchedElement.length && matchedElement.data('match') === refMatchValue) {
                        correctMatchAnswers++;
                        $(this).addClass('correct').removeClass('incorrect');
                        matchedElement.addClass('correct').removeClass('incorrect');
                    } else {
                        allMatchesCorrect = false;  
                        $(this).addClass('incorrect').removeClass('correct');
                        if (matchedElement.length) {
                            matchedElement.addClass('incorrect').removeClass('correct');
                        }
                    }
                });
                isCorrect = allMatchesCorrect;
                break;
                case 'tiles':
                    var allTilesCorrect = true;
                    var question = $(this);
                    $('.ans-tiles', this).each(function() {
                        var tileClass = $(this).attr('class').split(' ').find(c => c.startsWith('tile-'));
                        if (tileClass) {
                            var tileData = $(this).data('tiles');
                            var correspondingRef = $('.ans-ref.' + tileClass, question);
                            var refData = correspondingRef.data('tiles');
                            
                            if (tileData !== refData || !$(this).hasClass('selected')) {
                                allTilesCorrect = false;
                                $(this).addClass('incorrect'); // Mark incorrect ans-tiles
                                correspondingRef.addClass('incorrect'); // Mark corresponding ans-ref as incorrect
                            } else {
                                $(this).addClass('correct'); // Mark correct ans-tiles
                                correspondingRef.addClass('correct'); // Mark corresponding ans-ref as correct
                            }
                        }
                    });
                    isCorrect = allTilesCorrect;
                    break;
                case 'options':
                    var allOptionsCorrect = true;
                    var question = $(this);
                    $('.ans-options', this).each(function() {
                        var optionClass = $(this).attr('class').split(' ').find(c => c.startsWith('option-'));
                        if (optionClass) {
                            var optionData = $(this).data('options');
                            var correspondingRef = $('.ans-ref.' + optionClass, question);
                            var refData = correspondingRef.data('options');
                
                            if (optionData !== refData) {
                                allOptionsCorrect = false;
                                $(this).addClass('incorrect'); // Mark incorrect ans-options
                                correspondingRef.addClass('incorrect'); // Mark corresponding ans-ref as incorrect
                            } else {
                                $(this).addClass('correct'); // Mark correct ans-options
                                correspondingRef.addClass('correct'); // Mark corresponding ans-ref as correct
                            }
                        }
                    });
                    isCorrect = allOptionsCorrect;
                    break;
                    // Validation logic for 'dots'
                    case 'dots':
                        var correctSequence = $(this).find('.answer').data('answer').split(' ');
                        var isCorrect = (correctSequence.length === _this.clickedDotsSequence.length) &&
                                        correctSequence.every(function(value, index) { 
                                            return value === _this.clickedDotsSequence[index]; 
                                        });
                    
                        // Apply visual feedback
                        $('.ans-dots', this).each(function() {
                            var dotNumber = $(this).data('dots').toString();
                            if (_this.clickedDotsSequence.includes(dotNumber)) {
                                if (isCorrect) {
                                    $(this).addClass('correct').removeClass('incorrect');
                                } else {
                                    $(this).addClass('incorrect').removeClass('correct');
                                }
                            }
                        });
                    
                        // Reset clickedDotsSequence after checking
                        _this.clickedDotsSequence = [];
                        lastDotIndex = 0;
                        break;
                    
                    
                default:
                    // Handle unknown question types or do nothing
                    break;
            }
   
            // Counting correct and incorrect answers
            if (isCorrect) {
                $(this).addClass('correct').removeClass('incorrect');
                _this.worksheetResults[worksheetId].correctAnswers++;
            } else {
                $(this).addClass('incorrect').removeClass('correct');
                _this.worksheetResults[worksheetId].incorrectAnswers++;
            }

            // Storing the result for each question
            _this.worksheetResults[worksheetId].questions[questionId] = {
                isCorrect: isCorrect,
                correctAnswer: correctAnswer,
                totalMatches: totalMatches, // Relevant for 'match' type questions
                correctMatchAnswers: correctMatchAnswers // Relevant for 'match' type questions
            };
            console.log("Worksheet Results after population:", _this.worksheetResults);

        });
    });

    this.displayResult();
};

Hash.prototype.displayResult = function() {
    var _this = this;

    $('.worksheet').each(function() {
        var classList = $(this).attr('class').split(' ');
        var worksheetId = classList.find(function(className) {
            return /^w\d+$/.test(className);
        });

        var result = _this.worksheetResults[worksheetId];
        if (!result) {
            console.error("Result not found for worksheet:", worksheetId);
            return; // Skip this worksheet if no result found
        }
        console.log("Accessing results for worksheet:", worksheetId, result);

        var worksheetMessage = _this.config.customResultDisplay[worksheetId].message
            .replace('${correctWorksheet}', result.correctAnswers)
            .replace('${totalWorksheet}', result.totalQuestions);
        $(this).find('.w-msg').text(worksheetMessage);

        $(this).find('.question').each(function() {
            var classList = $(this).attr('class').split(' ');
            var questionId = classList.find(function(className) {
                return /^q\d+$/.test(className);
            });
            if (!questionId) {
                console.error("No question ID found for element:", this);
                return; // Skip this question if no ID found
            }
            var questionResult = result.questions[questionId];
            
            if (!questionResult) {
                console.error("Result not found for question:", questionId, "in worksheet:", worksheetId);
                return; // Skip this question if no result found
            }  
            if (!questionResult.isCorrect) {
                var questionConfig = _this.config.customResultDisplay[worksheetId][questionId];

                // Append .q-msg and .h-msg divs if they don't exist
                if ($(this).find('.h-msg').length === 0) {
                    $(this).prepend('<div class="h-msg"></div>');
                }
                if ($(this).find('.q-msg').length === 0) {
                    $(this).prepend('<div class="q-msg"></div>');
                }

                var questionMessage = questionConfig.message
                    .replace('${correctAnswer}', questionResult.correctAnswer)
                    .replace('${match}', questionResult.correctMatchAnswers || 0)
                    .replace('${totalMatch}', questionResult.totalMatches || 0);
                var hintMessage = questionConfig.hint || '';

                $(this).find('.q-msg').text(questionMessage);
                $(this).find('.h-msg').text(hintMessage);
            }
        });
    });
};

