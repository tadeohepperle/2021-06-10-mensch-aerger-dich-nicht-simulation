import json
from random import randrange
"""


        091011
        08
        07
        06
0102030405


"""


class GameState:
    # pinpositions can be 0 (homebase), 1-40 and -1,-2,-3,-4 for winning positions
    def __init__(self, **kwargs):
        self.pinPositions = {
            "p1":  kwargs["p1"] if "p1" in kwargs else [0, 0, 0, 0],
            "p2":  kwargs["p2"] if "p2" in kwargs else [0, 0, 0, 0],
            "p3":  kwargs["p3"] if "p3" in kwargs else [0, 0, 0, 0],
            "p4":  kwargs["p4"] if "p4" in kwargs else [0, 0, 0, 0],
        }
        self.currentPlayer = kwargs["currentPlayer"] if "currentPlayer" in kwargs else "p1"
        self.gameOver = kwargs["gameOver"] if "gameOver" in kwargs else False
        self.winners = kwargs["winners"] if "winners" in kwargs else []
        self.turn = kwargs["turn"] if "turn" in kwargs else 0

    def clone(self):
        return GameState(p1=[_ for _ in self.pinPositions["p1"]],
                         p2=[_ for _ in self.pinPositions["p2"]],
                         p3=[_ for _ in self.pinPositions["p3"]],
                         p4=[_ for _ in self.pinPositions["p4"]],
                         gameOver=self.gameOver,
                         winners=[_ for _ in self.winners],
                         currentPlayer=self.currentPlayer,
                         turn=self.turn
                         )

    def checkWinCondition(self):
        for player in ["p1", "p2", "p3", "p4"]:
            won = True
            for pin in range(4):
                if (self.pinPositions[player][pin] >= 0):
                    won = False
                    break
            if(won):
                self.winners.append(player)
        return len(self.winners)

    def __str__(self):
        return f"""Gamestate (Turn {self.turn}, {self.currentPlayer} to move):
        p1: {self.pinPositions["p1"]}
        p2: {self.pinPositions["p2"]}
        p3: {self.pinPositions["p3"]}
        p4: {self.pinPositions["p4"]}"""

    def playerCanThrowThreeDice(self, player):
        for pin in range(4):
            if(self.pinPositions[player][pin] > 0):
                return False
        return True


class Game:
    @staticmethod
    def rollDie():
        return randrange(1, 7)

    def __init__(self, **kwargs):
        self.gs = GameState()
        self.agents = {
            "p1":  kwargs["p1"] if "p1" in kwargs else Agent("p1"),
            "p2":  kwargs["p2"] if "p2" in kwargs else Agent("p2"),
            "p3":  kwargs["p3"] if "p3" in kwargs else Agent("p3"),
            "p4":  kwargs["p4"] if "p4" in kwargs else Agent("p4")
        }
        self.ended = False
        self.historyOfGameStates = []

    def calculatePossibleMoves(self, die):
        # list of tuples (pin (0 - 3), position (-4 - 40))
        possibleMoves = []
        playerToMove = self.gs.currentPlayer

        def relPos(pos):  # position relative to player start
            nonlocal playerToMove
            if(pos <= 0):
                return pos
            if(playerToMove == "p1"):
                return pos
            elif(playerToMove == "p2"):
                return pos - 10
            elif(playerToMove == "p3"):
                return pos - 20
            elif(playerToMove == "p4"):
                return pos - 30
            return (pos - 1) % 40 + 1

        def absPos(relPos):
            nonlocal playerToMove
            if(relPos <= 0):
                return relPos
            if(playerToMove == "p1"):
                return relPos
            elif(playerToMove == "p2"):
                return relPos + 10
            elif(playerToMove == "p3"):
                return relPos + 20
            elif(playerToMove == "p4"):
                return relPos + 30
            return (relPos - 1) % 40 + 1

        if(die == 6):
            # all just own pins:
            pinsAuf0 = []
            pinsAuf1 = []
            pinsAuf1PlusDie = []
            for pin in range(4):
                pos = self.gs.pinPositions[playerToMove][pin]
                if(pos == 0):
                    pinsAuf0.append(pin)
                if(pos == absPos(1)):
                    pinsAuf1.append(pin)
                if(pos == absPos(1+die)):
                    pinsAuf1PlusDie.append(pin)

            # case 1: there are still pins on 0, and 1 is free:
            # --> must move a pin from 0 to 1
            if(len(pinsAuf0) != 0 and len(pinsAuf1) == 0):
                possibleMoves = [(pinsAuf0[0], absPos(1))]
                return possibleMoves
            # case 2: there are still pins on 0 and 1 is blocked and 1+die is free:
            # --> must move pin from 1 to 1+6
            elif(len(pinsAuf0) != 0 and len(pinsAuf1) != 0 and len(pinsAuf1PlusDie) == 0):
                possibleMoves = [(pinsAuf1[0], absPos(1+6))]
                return possibleMoves

            # case 3: there are still pins on 0 and 1 is blocked and 1+die is not free:
            # --> do anything else... continue after if statement  like for all other numbers...

            # case 4: there are no pins on 0:
            # --> do anything else... continue after if statement  like for all other numbers...
        # in all other cases: determine all legal moves out of the maximum of 4 possible moves:
        for pin in range(4):
            pos = self.gs.pinPositions[playerToMove][pin]
            if(pos <= 0):  # cases with 0 are handled only when 6 is rolled (see above) and pins < 0 do not move anymore
                continue
            relativePos = relPos(pos)
            if(relativePos + die > 40):
                # would be over one turn, so can only go inside heaven:
                potentialPos = -(relativePos + die - 40)  # is a minus pos
                # check if free:
                potentialPosIsFree = True
                for pin2 in range(4):
                    pos2 = self.gs.pinPositions[playerToMove][pin2]
                    if(pos2 == potentialPos):
                        potentialPosIsFree = False
                        break
                if(potentialPosIsFree):
                    possibleMoves.append((pin, potentialPos))
            else:
                potentialPos = pos + die
                potentialPosIsFree = True
                for pin2 in range(4):
                    pos2 = self.gs.pinPositions[playerToMove][pin2]
                    if(pos2 == potentialPos):
                        potentialPosIsFree = False
                        break
                if(potentialPosIsFree):
                    possibleMoves.append((pin, potentialPos))
        return possibleMoves

    def simulateTurn(self):

        currentPlayer = self.gs.currentPlayer

        # a player who cant move without a 6 (has all pins except 1 or two in 0 or end fields) can throw 3 times a die, to roll a 6:
        usedAll3Rolls = False
        die = Game.rollDie()
        print(f"{currentPlayer} rolls {die}")
        if(die != 6 and self.gs.playerCanThrowThreeDice(currentPlayer)):
            die = Game.rollDie()
            print(f"{currentPlayer} rolls {die}")
            if(die != 6):
                die = Game.rollDie()
                print(f"{currentPlayer} rolls {die}")
                usedAll3Rolls = True
        possibleMoves = self.calculatePossibleMoves(die)
        agent = self.agents[currentPlayer]
        movePicked = agent.pickMoveFromPossibleMoves(
            possibleMoves, self.gs)
        print(f"agent of {currentPlayer} picks {str(movePicked)}")
        if(movePicked == None):
            newGameState = self.gs.clone()
            # determine next player
            newGameState.currentPlayer = self.determineNextPlayer(
                die, usedAll3Rolls)
            self.applyNewGameState(newGameState)
        else:
            pinToMove, posToMoveTo = movePicked
            newGameState = self.gs.clone()
            # search for enemy pins to kick to 0:
            enemies = ["p1", "p2", "p3", "p4"]
            enemies.remove(currentPlayer)
            for e in enemies:
                for enemyPin in range(4):
                    if(newGameState.pinPositions[e][enemyPin] == posToMoveTo):
                        newGameState.pinPositions[e][enemyPin] = 0
            # set pin moved to new position:
            newGameState.pinPositions[currentPlayer][pinToMove] = posToMoveTo
            # determine next player
            newGameState.currentPlayer = self.determineNextPlayer(
                die, usedAll3Rolls)
            self.applyNewGameState(newGameState)
        # put this in turn or in turn loop???
        numberOfPlayersWon = self.gs.checkWinCondition()
        if(numberOfPlayersWon >= 3):
            self.endGame()
        print(self.gs)

    def determineNextPlayer(self, die, usedAll3Rolls):
        currentPlayer = self.gs.currentPlayer
        if(die == 6 and not usedAll3Rolls):
            # go again if this was not the 6 on the third attempt of a three roll
            return currentPlayer
        else:
            skipPlayers = 0
            nextPlayer = currentPlayer
            while(skipPlayers < 4):
                nextPlayer = {"p1": "p2", "p2": "p3",
                              "p3": "p4", "p4": "p1"}[currentPlayer]
                if(not (nextPlayer in self.gs.winners)):
                    return nextPlayer
                skipPlayers += 1
            self.endGame()

    def endGame(self):
        self.ended = True
        print(f"Game Ended. Winners: {str(self.gs.winners)}")

    def applyNewGameState(self, newGameState):
        self.historyOfGameStates.append(self.gs)
        self.gs.turn += 1
        self.gs = newGameState

    def startGame(self, interactive):
        print(self.gs)
        # while(not self.ended):
        #     if(interactive):
        #         x = input()
        #     self.simulateTurn()
        self.writeGameHistoryToFile("./gameData.json")

    def writeGameHistoryToFile(self, filepath):
        with open(filepath, 'w') as outfile:
            json.dump(self.historyOfGameStates, outfile)


class Agent:

    def __init__(self, *args, **kwargs):
        pass

    def pickMoveFromPossibleMoves(self, possibleMoves, gameState):
        if(len(possibleMoves) > 0):
            return possibleMoves[0]
        else:
            return None


game = Game()
game.startGame(True)
