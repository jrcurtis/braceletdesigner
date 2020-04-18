
window.addEventListener('load', function ()
{
    var pattern = {};
    var colorCache;
    var canvas;
    var ctx;

    var numStringsInput;
    var numColorsInput;
    var numRowsInput;
    var colorsList;
    var stringColorsList;
    var patternDiv;
    var patternText;
    var patternTextMessage;
    var patternKnots;
    var patternKnotsMessage;

    var knotTypes = ['f', 'b', 'fb', 'bf'];
    var knotsFlipped = {'f': 'b', 'b': 'f', 'fb': 'bf', 'bf': 'fb'};
    
    function init()
    {
        randomize();

        numStringsInput = document.getElementById('num-strings');
        numStringsInput.addEventListener('input', function (e)
        {
            setNumStrings(e.target.value);
            updateUI();
            drawPreview();
        });

        numColorsInput = document.getElementById('num-colors');
        numColorsInput.addEventListener('input', function (e)
        {
            setNumColors(e.target.value);
            updateUI();
            drawPreview();
        });

        numRowsInput = document.getElementById('num-rows');
        numRowsInput.addEventListener('input', function (e)
        {
            setNumRows(e.target.value);
            updateUI();
            drawPreview();
        });

        colorsList = document.getElementById('colors-list');
        stringColorsList = document.getElementById('string-colors-list');
        patternDiv = document.getElementById('pattern');
        patternText = document.getElementById('pattern-text');
        patternTextMessage = document.getElementById('pattern-text-message');
        patternKnots = document.getElementById('pattern-knots');
        patternKnotsMessage = document.getElementById('pattern-knots-message');

        document.getElementById('deserialize-pattern').addEventListener('click', deserialize);

        document.getElementById('load-knots').addEventListener('click', loadKnots);

        document.getElementById('randomize').addEventListener('click', function(e)
        {
            randomize();
            updateUI();
            drawPreview();
        });

        document.getElementById('flip-h').addEventListener('click', function (e)
        {
            flipHorizontally();
            updateUI();
            drawPreview();
        });

        document.getElementById('flip-v').addEventListener('click', function (e)
        {
            flipVertically();
            updateUI();
            drawPreview();
        });

        document.getElementById('double-h').addEventListener('click', function (e)
        {
            doubleHorizontally();
            updateUI();
            drawPreview();
        });

        document.getElementById('double-v').addEventListener('click', function (e)
        {
            doubleVertically();
            updateUI();
            drawPreview();
        });

        document.getElementById('mirror-h').addEventListener('click', function (e)
        {
            mirrorHorizontally();
            updateUI();
            drawPreview();
        });

        document.getElementById('mirror-v').addEventListener('click', function (e)
        {
            mirrorVertically();
            updateUI();
            drawPreview();
        });

        updateUI();

        canvas = document.getElementById('pattern-preview');
        ctx = canvas.getContext('2d');
        drawPreview();
    }

    function randomize()
    {
        pattern.numStrings = 6 + Math.floor(20 * Math.random());
        var numColors = 2 + Math.floor(pattern.numStrings / 2 * Math.random());

        pattern.colors = [];
        for (var i = 0; i < numColors; i++)
        {
            var color = '#';
            for (var j = 0; j < 3; j++)
            {
                var c = Math.floor(16 * Math.random()).toString(16);
                color += c + c;
            }
            pattern.colors.push(color);
        }

        pattern.stringColors = [];
        for (var i = 0; i < pattern.numStrings; i++)
        {
            pattern.stringColors.push(Math.floor(pattern.colors.length * Math.random()));
        }

        pattern.knots = [];
        var numKnotRows = 2 + 2 * Math.floor(10 * Math.random());
        for (var i = 0; i < numKnotRows; i++)
        {
            pattern.knots.push([]);
            var numKnots = Math.floor((pattern.numStrings - i % 2) / 2);
            for (var j = 0; j < numKnots; j++)
            {
                pattern.knots[i].push(knotTypes[Math.floor(4 * Math.random())]);
            }
        }

    }

    function updateUI()
    {
        numStringsInput.value = pattern.numStrings;
        numColorsInput.value = pattern.colors.length;
        numRowsInput.value = pattern.knots.length;

        while (colorsList.children.length < pattern.colors.length)
        {
            var li = document.createElement('li');
            var input = document.createElement('input');
            input.type = 'color';

            input.addEventListener('input', function (i)
            {
                return function (e)
                {
                    setColor(i, e.target.value);
                    drawPreview();
                }
            }(colorsList.children.length));

            input.addEventListener('change', serialize);

            li.appendChild(input);
            colorsList.appendChild(li);
        }

        while (colorsList.children.length > pattern.colors.length)
        {
            colorsList.removeChild(colorsList.lastChild);
        }

        for (var i = 0; i < colorsList.children.length; i++)
        {
            colorsList.children[i].firstChild.value = pattern.colors[i];
        }

        while (stringColorsList.children.length < pattern.numStrings)
        {
            var li = document.createElement('li');
            var input = document.createElement('input');

            input.addEventListener('input', function (i)
            {
                return function (e)
                {
                    setStringColor(i, e.target.value - 1);
                    serialize();
                    drawPreview();
                }
            }(stringColorsList.children.length));

            input.type = 'number';
            li.appendChild(input);
            stringColorsList.appendChild(li);
        }

        while (stringColorsList.children.length > pattern.numStrings)
        {
            stringColorsList.removeChild(stringColorsList.lastChild);
        }

        for (var i = 0; i < stringColorsList.children.length; i++)
        {
            var input = stringColorsList.children[i].firstChild;
            input.min = "1";
            input.max = pattern.colors.length.toString();
            input.value = pattern.stringColors[i] + 1;
        }

        while (patternDiv.children.length > pattern.knots.length + 1)
        {
            patternDiv.removeChild(patternDiv.lastChild);
        }

        while (patternDiv.children.length < pattern.knots.length + 1)
        {
            var i = patternDiv.children.length;
            var rowDiv = document.createElement('div');
            rowDiv.classList.add(i % 2 == 0 ? 'even' : 'odd');
            rowDiv.id = 'knot-row-' + i;
            patternDiv.appendChild(rowDiv);
        }

        for (var i = 0; i < pattern.knots.length + 1; i++)
        {
            var knotRow = i % pattern.knots.length;
            var rowDiv = patternDiv.children.item(i);

            while (rowDiv.children.length > pattern.knots[knotRow].length)
            {
                rowDiv.removeChild(rowDiv.lastChild);
            }

            while (rowDiv.children.length < pattern.knots[knotRow].length)
            {
                var j = rowDiv.children.length;

                var knotCol = j;
                var knotDiv = document.createElement('div');
                knotDiv.classList.add('knot');
                knotDiv.id = 'knot-' + i + '-' + j;
                knotDiv.classList.add(pattern.knots[knotRow][knotCol]);

                var stringA = document.createElement('div');
                stringA.id = knotDiv.id + '-a';
                stringA.classList.add('string');
                stringA.classList.add('a');

                var stringB = document.createElement('div');
                stringB.id = knotDiv.id + '-b';
                stringB.classList.add('string');
                stringB.classList.add('b');

                knotDiv.appendChild(stringA);
                knotDiv.appendChild(stringB);

                knotDiv.addEventListener('click', function (kr, kc)
                {
                    return function(e)
                    {
                        var knotType = pattern.knots[kr][kc];
                        var knotTypeI = knotTypes.indexOf(knotType);
                        var nextKnotType = knotTypes[(knotTypeI + 1) % knotTypes.length];

                        e.target.classList.remove(knotType);
                        e.target.classList.add(nextKnotType);

                        setKnot(kr, kc, nextKnotType);
                        serialize();
                        drawPreview();
                    }
                }(i, j));

                rowDiv.appendChild(knotDiv);
            }

            for (var j = 0; j < pattern.knots[knotRow].length; j++)
            {
                var knotId = 'knot-' + i + '-' + j;
                var knotDiv = document.getElementById(knotId);

                knotDiv.classList.remove('f', 'b', 'fb', 'bf');
                knotDiv.classList.add(pattern.knots[knotRow][j]);

                var stringA = document.getElementById(knotId + '-a');
                var stringB = document.getElementById(knotId + '-b');

                if (i == 0)
                {
                    continue;
                }
                else if (j == 0 && i % 2 == 0)
                {
                    stringA.classList.add('loose')
                }
                else if (j == pattern.knots[knotRow].length - 1
                         && i % 2 == pattern.numStrings % 2)
                {
                    stringB.classList.add('loose');
                }
                else
                {
                    stringA.classList.remove('loose');
                    stringB.classList.remove('loose');
                }
            }
        }

        serialize();
    }

    function setNumStrings(n)
    {
        n = Math.max(n, 2);

        pattern.numStrings = n; 

        while (pattern.stringColors.length < pattern.numStrings)
        {
            pattern.stringColors.push(0);
        }

        while (pattern.stringColors.length > pattern.numStrings)
        {
            pattern.stringColors.pop();
        }

        for (var i = 0; i < pattern.knots.length; i++)
        {
            var numKnots = Math.floor((pattern.numStrings - i % 2) / 2);

            while (pattern.knots[i].length < numKnots)
            {
                pattern.knots[i].push('f');
            }

            while (pattern.knots[i].length > numKnots)
            {
                pattern.knots[i].pop();
            }
        }
    }

    function setNumColors(n)
    {
        n = Math.max(n, 1);

        while (pattern.colors.length < n)
        {
            pattern.colors.push('#000000');
        }

        while (pattern.colors.length > n)
        {
            pattern.colors.pop();
        }

        for (var i = 0; i < pattern.numStrings; i++)
        {
            pattern.stringColors[i] = Math.min(Math.max(pattern.stringColors[i], 0), pattern.colors.length - 1);
        }
    }

    function setNumRows(n)
    {
        n = Math.max(n, 1);

        while (pattern.knots.length < n)
        {
            var i = pattern.knots.length;
            var numKnots = Math.floor((pattern.numStrings - i % 2) / 2);
            var knotRow = [];
            for (var j = 0; j < numKnots; j++)
            {
                knotRow.push('f');
            }

            pattern.knots.push(knotRow);
        }

        while (pattern.knots.length > n)
        {
            pattern.knots.pop();
        }
    }

    function getKnotColor(row, col)
    {

    }

    function setColor(i, color)
    {
        pattern.colors[i] = color;
    }


    function setKnot(row, col, knot)
    {
        pattern.knots[row][col] = knot;
    }

    function setStringColor(i, color)
    {
        pattern.stringColors[i] = Math.min(Math.max(color, 0), pattern.colors.length - 1);
    }

    function flipHorizontally()
    {
        if (pattern.numStrings % 2 == 1)
        {
            var start = pattern.knots.shift();
            pattern.knots.push(start);
            pattern.stringColors = Array.from(colorCache[1]);
        }

        pattern.stringColors.reverse();

        for (var i = 0; i < pattern.knots.length; i++)
        {
            pattern.knots[i].reverse();

            for (var j = 0; j < pattern.knots[i].length; j++)
            {
                pattern.knots[i][j] = knotsFlipped[pattern.knots[i][j]];
            }
        }
    }

    function flipVertically()
    {
        if (pattern.numStrings % 2 == 0)
        {
            var end = pattern.knots.pop();
            pattern.knots.reverse();
            pattern.knots.push(end);
            pattern.stringColors = Array.from(colorCache[pattern.knots.length - 1]);
        }
        else
        {
            pattern.knots.reverse();
            pattern.stringColors = Array.from(colorCache[pattern.knots.length]);
        }

        for (var i = 0; i < pattern.knots.length; i++)
        {
            for (var j = 0; j < pattern.knots[i].length; j++)
            {
                pattern.knots[i][j] = knotsFlipped[pattern.knots[i][j]];
            }
        }
    }

    function doubleHorizontally()
    {
        for (var i = 0; i < pattern.knots.length; i++)
        {
            if (pattern.numStrings % 2 == 0 && i % 2 == 1)
            {
                pattern.knots[i] = pattern.knots[i].concat(['fb'], pattern.knots[i]);
            }
            else if (pattern.numStrings % 2 == 1)
            {
                pattern.knots[i] = pattern.knots[i].concat(['fb'], pattern.knots[i]);
            }
            else
            {
                pattern.knots[i] = pattern.knots[i].concat(pattern.knots[i]);
            }
        }

        if (pattern.numStrings % 2 == 0)
        {
            pattern.numStrings *= 2;
            pattern.stringColors = pattern.stringColors.concat(pattern.stringColors);
        }
        else
        {
            pattern.numStrings = 2 * pattern.numStrings + 1;
            pattern.stringColors = pattern.stringColors.concat([pattern.stringColors[pattern.stringColors.length - 1]], pattern.stringColors);
        }
    }

    function doubleVertically()
    {
        var length = pattern.knots.length;
        for (var i = 0; i < length; i++)
        {
            pattern.knots.push(Array.from(pattern.knots[i]));
        }
    }

    function mirrorHorizontally()
    {
        for (var i = 0; i < pattern.knots.length; i++)
        {
            var row = Array.from(pattern.knots[i]);
            row.reverse();

            for (var j = 0; j < row.length; j++)
            {
                row[j] = knotsFlipped[row[j]];
            }

            if (pattern.numStrings % 2 == 0 && i % 2 == 1)
            {
                pattern.knots[i] = pattern.knots[i].concat(['fb'], row);
            }
            else if (pattern.numStrings % 2 == 1 && i % 2 == 0)
            {
                pattern.knots[i] = pattern.knots[i].concat(['fb'], row);
            }
            else
            {
                pattern.knots[i] = pattern.knots[i].concat(row);
            }
        }

        var stringColors = Array.from(pattern.stringColors);
        stringColors.reverse();
        pattern.numStrings *= 2;
        pattern.stringColors = pattern.stringColors.concat(stringColors);
    }

    function mirrorVertically()
    {
        var length = pattern.knots.length;
        for (var i = 0; i < length; i++)
        {
            var row = Array.from(pattern.knots[(2 * length - i - 2) % length]);

            for (var j = 0; j < row.length; j++)
            {
                row[j] = knotsFlipped[row[j]];
            }

            pattern.knots.push(row);
        }
    }

    function serialize()
    {
        patternText.value = JSON.stringify(pattern);

        var s = '';
        for (var i = 0; i < pattern.knots.length; i++)
        {
            s += pattern.knots[i];
            s += '\n';
        }
        patternKnots.value = s;
    }

    function deserialize()
    {
        try
        {
            var patternData = JSON.parse(patternText.value);
        }
        catch (ex)
        {
            serializationMessage('JSON syntax error', true);
            return;
        }

        if (!patternData.hasOwnProperty('numStrings'))
        {
            serializationMessage('Missing numStrings', true);
        }
        else if (patternData.numStrings < 2)
        {
            serializationMessage('Pattern must have at least 2 strings', true);
        }
        else if (!patternData.hasOwnProperty('colors'))
        {
            serializationMessage('Missing colors', true);
        }
        else if (!patternData.hasOwnProperty('stringColors'))
        {
            serializationMessage('Missing stringColors', true);
        }
        else if (patternData.stringColors.length != patternData.numStrings)
        {
            serializationMessage('numStrings and length of stringColors do not match', true);
        }
        else if (!patternData.hasOwnProperty('knots'))
        {
            serializationMessage('Missing knots', true);
        }
        else
        {
            pattern = patternData;
            updateUI();
            drawPreview();
            serializationMessage('Load successful', false);
        }
    }

    function serializationMessage(msg, error)
    {
        patternTextMessage.textContent = msg;
        if (error)
        {
            patternTextMessage.classList.remove('success');
            patternTextMessage.classList.add('error');
        }
        else
        {
            patternTextMessage.classList.remove('error');
            patternTextMessage.classList.add('success');
        }
    }

    function loadKnots()
    {
        var knotsLines = patternKnots.value.trim().split('\n');
        var knotsData = [];
        for (var i = 0; i < knotsLines.length; i++)
        {
            knotsData.push(knotsLines[i].split(','));

            if (knotsData[i].length != Math.floor((pattern.numStrings - i % 2) / 2))
            {
                knotsMessage('Wrong number of knots on line ' + (i + 1), true);
                return;
            }

            for (var j = 0; j < knotsData[i].length; j++)
            {
                if (knotTypes.indexOf(knotsData[i][j]) < 0)
                {
                    knotsMessage('Unrecognized knot on row ' + i + ', knot ' + j, true);
                    return;
                }
            }
        }

        pattern.knots = knotsData;
        updateUI();
        drawPreview();
        knotsMessage('Load successful', false);
    }

    function knotsMessage(msg, error)
    {
        patternKnotsMessage.textContent = msg;
        if (error)
        {
            patternKnotsMessage.classList.remove('success');
            patternKnotsMessage.classList.add('error');
        }
        else
        {
            patternKnotsMessage.classList.remove('error');
            patternKnotsMessage.classList.add('success');
        }
    }

    function drawPreview()
    {
        var knotSize = 10;
        var knotDiag = Math.sqrt(2) * knotSize;

        var width = document.body.clientWidth;
        var height = knotDiag * pattern.numStrings / 2;
        canvas.width = width;
        canvas.height = height;

        colorCache = [];
        var colors = [];
        for (var i = 0; i < pattern.stringColors.length; i++)
        {
            colors.push(pattern.stringColors[i]);
        }

        for (var i = 0; i < 2 * width / knotDiag; i++)
        {
            var knotRowI = i % pattern.knots.length;
            var knotRow = pattern.knots[knotRowI];
            var stringOffset = knotRowI % 2;
            var nextColors = Array.from(colors);

            for (var j = 0; j < knotRow.length; j++)
            {
                var firstString = stringOffset + j * 2;
                var x = knotDiag + i * knotDiag / 2;
                var y = height - 1.25 * knotDiag / 2 - knotDiag / 2 * stringOffset - knotDiag * j;
                var color = pattern.colors[colors[firstString + (knotRow[j].startsWith('f') ? 0 : 1)]];

                if (i <= pattern.knots.length)
                {
                    colorCache.push(Array.from(colors));
                    var id = 'knot-' + i + '-' + j;
                    document.getElementById(id).style.backgroundColor = color;
                    document.getElementById(id + '-a').style.backgroundColor = pattern.colors[colors[firstString]];
                    document.getElementById(id + '-b').style.backgroundColor = pattern.colors[colors[firstString + 1]];
                    
                }

                if (knotRow[j].length == 1)
                {
                    nextColors[firstString] = colors[firstString + 1];
                    nextColors[firstString + 1] = colors[firstString];
                }
                ctx.fillStyle = color;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 4);
                ctx.fillRect(-knotSize / 2, -knotSize / 2, knotSize, knotSize);
                if (j == 0 && stringOffset == 0)
                {
                    ctx.fillStyle = pattern.colors[nextColors[0]];
                    ctx.fillRect(knotSize / 2, -knotSize / 2, knotSize, knotSize);
                }
                else if (j == knotRow.length - 1 && stringOffset == pattern.numStrings % 2)
                {
                    ctx.fillStyle = pattern.colors[nextColors[colors.length - 1]];
                    ctx.fillRect(-knotSize / 2, -3 * knotSize / 2, knotSize, knotSize);
                }
                ctx.restore();
            }

            colors = nextColors;
        }
    }

    init();
});


