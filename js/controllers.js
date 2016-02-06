(function(){

	var app = angular.module("simonGame", ['ngAudio']);

	app.controller("MainCtrl", ["$scope", "ngAudio", function($scope, ngAudio) {

		$scope.sequence = [];

		$scope.currentScore = 0;
		$scope.currentStep = 0;
		$scope.maxStep = 0; // Number of correct presses for advancing to the next level

		$scope.soundInterval = null; // Used for controlling the timing with window.setInterval
		$scope.currentSound = 0; // Just a utility variable for playing the sequence

		// Which button should be highlighted
		$scope.highlights = [false, false, false, false];

		// Sounds that buttons play when pressed
		$scope.sounds = [ngAudio.load("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"), ngAudio.load("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
		 ngAudio.load("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"), ngAudio.load("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3")];
		$scope.failSound = ngAudio.load("sounds/fail_sound.mp3");


		// Game state variables
		$scope.strict = false;
		$scope.gameRunning = false;
		$scope.allowPlayerAction = false;
		$scope.gameState = 0; // Value 1 is if user wins, -1 if user loses (only in strict mode), 0 if the game is stopped or still running.

		$scope.changeStrict = function(){
			$scope.strict = !$scope.strict;
		}


		$scope.startGame = function() {
			clearInterval($scope.soundInterval); // If a user resets the game while the sequence is playing
			$scope.gameState = 0;
			$scope.sequence = [];
			for(var i = 0; i < 20; i++) {
				$scope.sequence.push(Math.floor(Math.random() * 4));
			}
			$scope.currentScore = 0;
			$scope.currentStep = 0;
			$scope.maxStep = 0;
			$scope.gameRunning = true;
			$scope.playSequence(); // Play the first sound

		}


		$scope.playerClick = function(number) {

			if($scope.allowPlayerAction) { // Disallows clicking while the sequence is playing

				// I used this way to highlight on mouse press instead of
				// CSS because this prevents highlighting when the game isn't running.
				$scope.highlight(number);
				window.setTimeout($scope.removeHighlights, 200);


				if(number == $scope.sequence[$scope.currentStep]) { // If user presses the correct button in the sequence

					$scope.playSound(number);

					if($scope.currentStep == 19) { // Game over, player won
						$scope.gameState = 1;
						$scope.currentStep = 0;
						$scope.maxStep = 0;
						$scope.currentScore = 0;
						$scope.allowPlayerAction = false;
					} 
					else if ($scope.currentStep == $scope.maxStep) {
						$scope.maxStep++;
						$scope.currentStep = 0;
						$scope.currentScore = $scope.maxStep; 
						window.setTimeout($scope.playSequence, 500);  // Plays the sequence after 0.5s after advancing to the next level
					} 
					else {
						$scope.currentStep++;
					}
				} 
				else {
					if($scope.strict) { // Player loses the game as he made a mistake in strict mode
						$scope.gameState = -1;
						$scope.currentStep = 0;
						$scope.maxStep = 0;
						$scope.currentScore = 0;
						$scope.failSound.play();
						$scope.allowPlayerAction = false;
					} 
					else { // Resets the current level and replays the sequence
						$scope.currentStep = 0;
						$scope.failSound.play();
						$scope.allowPlayerAction = false;
						window.setTimeout($scope.playSequence, 1500);
					}
				}
			}

		}

		// Play the sound of the corresponding button
		$scope.playSound = function(number) {
			$scope.sounds[number].play();
		}

		// Plays the sequence for user to remember.
		// Uses setInterval to control the timing, which plays each sound 0.8s after the previous,
		// otherwise all the sounds would play at once
		// Also highlights the button making it easier for user to remember.
		// Disallows any user action while the sequence is playing.
		$scope.playSequence = function() {

			$scope.allowPlayerAction = false;
			$scope.currentSound = 0;
			$scope.soundInterval = window.setInterval(function(){

				$scope.highlight($scope.sequence[$scope.currentSound]);
				$scope.playSound($scope.sequence[$scope.currentSound++]);
				if($scope.currentSound > $scope.maxStep){

					window.clearInterval($scope.soundInterval);
					$scope.allowPlayerAction = true;
				}
				window.setTimeout($scope.removeHighlights, 200);
			}, 800);
		} 

		$scope.highlight = function(number) {
			$scope.highlights[number] = true;
		}

		$scope.removeHighlights = function() {
			for(var i = 0; i < $scope.highlights.length; i++) {
				$scope.highlights[i] = false;
			}
		}

		// Displays the result of the game
		$scope.displayResult = function() {
			if($scope.gameState == 1) {
				return "Congratulations, you won! Good job!";
			}

			else if($scope.gameState == -1) {
				return "You lost! Try again or try turning the strict mode off!";
			}
		}

	}]);
})();