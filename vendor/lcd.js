/*
 * Copyright (c) 2013 by Gerrit Grunwald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 var Lcd = function(parameters) {
    var doc                     = document;

    var param                   = parameters                    || {};
    var id                      = param.id                      || 'control';
    var parentId                = param.parentId                || 'body';
    var upperCenterText         = param.upperCenterText         || '';
    var upperCenterTextVisible  = param.upperCenterTextVisible  || false;
    var unit                    = param.unitString              || '';
    var unitVisible             = param.unitVisible             || false;
    var lowerRightText          = param.lowerRightText          || '';
    var lowerRightTextVisible   = param.lowerRightTextVisible   || false;
    var value                   = param.value                   || 0;
    var decimals                = param.decimals                || 2;
    var threshold               = param.threshold               || 100;
    var thresholdVisible        = param.thresholdVisible        || false;
    var upperLeftText           = param.upperLeftText           || 0;
    var upperLeftTextVisible    = param.upperLeftTextVisible    || false;
    var upperRightText          = param.upperRightText          || 0;
    var upperRightTextVisible   = param.upperRightTextVisible   || false;
    var lowerCenterText         = param.lowerCenterText         || '';
    var lowerCenterTextVisible  = param.lowerCenterTextVisible  || false;
    var battery                 = param.threshold               || '';
    var batteryVisible          = param.batteryVisible          || false;
    var trend                   = param.trend                   || '';
    var trendVisible            = param.trendVisible            || false;
    var crystalEffectVisible    = param.crystalEffectVisible    || false;
    var width                   = param.width                   || window.innerWidth;
    var height                  = param.height                  || window.innerWidth * 0.2666666666;
    var scalable                = param.scalable                || false;
    var design                  = param.design                  || 'standard';
    var foregroundShadowEnabled = param.foregroundShadowEnabled || false;

    var foregroundColor        = 'rgb(53, 42, 52)';
    var backgroundColor        = 'rgba(53, 42, 52, 0.1)';
     
    if (scalable) window.addEventListener("resize", onResize, false);

    const LCD_FONT_NAME = 'digital-7mono';
    var lcdFontHeight   = Math.floor(0.5833333333 * height);
    var lcdFont         = lcdFontHeight + 'px ' + LCD_FONT_NAME;

    const STD_FONT_NAME = 'Arial, sans-serif';
    var lcdUnitFont     = (0.26 * height) + 'px ' + STD_FONT_NAME;
    var lcdTitleFont    = (0.1666666667 * height) + 'px ' + STD_FONT_NAME;
    var lcdSmallFont    = (0.1666666667 * height) + 'px ' + STD_FONT_NAME;

    var minMeasuredValue = 100;
    var maxMeasuredValue = 0;
    var formerValue      = 0;

    // Create <canvas> element
    var canvas = doc.createElement('canvas');
    canvas.id  = id;
    if (parentId === 'body') {
        doc.body.appendChild(canvas);
    } else {
        doc.getElementById(parentId).appendChild(canvas);
    }

    var mainCtx     = doc.getElementById(id).getContext('2d');
    var lcdBuffer   = doc.createElement('canvas');
    var textBuffer  = doc.createElement('canvas');
    var iconsBuffer = doc.createElement('canvas');


    // ******************** private methods ************************************         
    var drawLcd = function() {
        var ctx    = lcdBuffer.getContext("2d");
        var width  = lcdBuffer.width;
        var height = lcdBuffer.height;

        var radius = 0.09375 * height;

        ctx.clearRect(0, 0, width, height);
                
        // adjust design
        var frame = ctx.createLinearGradient(0, 0, 0, height);
        frame.addColorStop(0.0, 'rgb(26, 26, 26)');
        frame.addColorStop(0.01, 'rgb(77, 77, 77)');
        frame.addColorStop(0.83, 'rgb(77, 77, 77)');
        frame.addColorStop(1.0, 'rgb(221, 221, 221)');
        
        var main = ctx.createLinearGradient(0, 0.021 * height, 0, 0.98 * height);
        if (design =='lcd-beige') {
            main.addColorStop(0.0, 'rgb(200, 200, 177)');
            main.addColorStop(0.005, 'rgb(241, 237, 207)');
            main.addColorStop(0.5, 'rgb(234, 230, 194)');
            main.addColorStop(0.5, 'rgb(225, 220, 183)');
            main.addColorStop(1.0, 'rgb(237, 232, 191)');
            foregroundColor = 'rgb(0, 0, 0)';
            backgroundColor = 'rgba(0, 0, 0, 0.1)';
        } else if (design == 'blue') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(231, 246, 255)');
            main.addColorStop(0.5, 'rgb(170, 224, 255)');
            main.addColorStop(0.5, 'rgb(136, 212, 255)');
            main.addColorStop(1.0, 'rgb(192, 232, 255)');
            foregroundColor = 'rgb( 18, 69, 100)';
            backgroundColor = 'rgba(18, 69, 100, 0.1)';
        } else if (design == 'orange') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(255, 245, 225)');
            main.addColorStop(0.5, 'rgb(255, 217, 147)');
            main.addColorStop(0.5, 'rgb(255, 201, 104)');
            main.addColorStop(1.0, 'rgb(255, 227, 173)');
            foregroundColor = 'rgb( 80, 55, 0)';
            backgroundColor = 'rgba(80, 55, 0, 0.1)';
        } else if (design == 'red') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(255, 225, 225)');
            main.addColorStop(0.5, 'rgb(252, 114, 115)');
            main.addColorStop(0.5, 'rgb(252, 114, 115)');
            main.addColorStop(1.0, 'rgb(254, 178, 178)');
            foregroundColor = 'rgb( 79, 12, 14)';
            backgroundColor = 'rgba(79, 12, 14, 0.1)';
        } else if (design == 'yellow') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(245, 255, 186)');
            main.addColorStop(0.5, 'rgb(158, 205,   0)');
            main.addColorStop(0.5, 'rgb(158, 205,   0)');
            main.addColorStop(1.0, 'rgb(210, 255,   0)');
            foregroundColor = 'rgb( 64, 83, 0)';
            backgroundColor = 'rgba(64, 83, 0, 0.1)';
        } else if (design == 'white') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(255, 255, 255)');
            main.addColorStop(0.5, 'rgb(241, 246, 242)');
            main.addColorStop(0.5, 'rgb(229, 239, 244)');
            main.addColorStop(1.0, 'rgb(255, 255, 255)');
            foregroundColor = 'rgb(0, 0, 0)';
            backgroundColor = 'rgba(0, 0, 0, 0.1)';
        } else if (design == 'gray') {
            main.addColorStop(0.0, 'rgb( 65,  65,  65)');
            main.addColorStop(0.005, 'rgb(117, 117, 117)');
            main.addColorStop(0.5, 'rgb( 87,  87,  87)');
            main.addColorStop(0.5, 'rgb( 65,  65,  65)');
            main.addColorStop(1.0, 'rgb( 81,  81,  81)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'black') {
            main.addColorStop(0.0, 'rgb( 65,  65,  65)');
            main.addColorStop(0.005, 'rgb(102, 102, 102)');
            main.addColorStop(0.5, 'rgb( 51,  51,  51)');
            main.addColorStop(0.5, 'rgb(  0,   0,   0)');
            main.addColorStop(1.0, 'rgb( 51,  51,  51)');
            foregroundColor = 'rgb(204, 204, 204)';
            backgroundColor = 'rgba(204, 204, 204, 0.1)';
        } else if (design == 'green') {
            main.addColorStop(0.0, 'rgb( 33,  67,  67)');
            main.addColorStop(0.005, 'rgb( 33,  67,  67)');
            main.addColorStop(0.5, 'rgb( 29,  58,  58)');
            main.addColorStop(0.5, 'rgb( 28,  57,  57)');
            main.addColorStop(1.0, 'rgb( 23,  46,  46)');
            foregroundColor = 'rgb(  0, 185, 165)';
            backgroundColor = 'rgba(0,  185, 165, 0.1)';
        } else if (design == 'green-darkgreen') {
            main.addColorStop(0.0, 'rgb( 27,  41,  17)');
            main.addColorStop(0.005, 'rgb( 70,  84,  58)');
            main.addColorStop(0.5, 'rgb( 36,  60,  14)');
            main.addColorStop(0.5, 'rgb( 24,  50,   1)');
            main.addColorStop(1.0, 'rgb(  8,  10,   7)');
            foregroundColor = 'rgb(152,  255, 74)';
            backgroundColor = 'rgba(152, 255, 74, 0.1)';
        } else if (design == 'blue2') {
            main.addColorStop(0.0, 'rgb(  0,  68, 103)');
            main.addColorStop(0.005, 'rgb(  8, 109, 165)');
            main.addColorStop(0.5, 'rgb(  0,  72, 117)');
            main.addColorStop(0.5, 'rgb(  0,  72, 117)');
            main.addColorStop(1.0, 'rgb(  0,  68, 103)');
            foregroundColor = 'rgb(111, 182, 228)';
            backgroundColor = 'rgba(111, 182, 228, 0.1)';
        } else if (design == 'blue-black') {
            main.addColorStop(0.0, 'rgb( 22, 125, 212)');
            main.addColorStop(0.005, 'rgb(  3, 162, 254)');
            main.addColorStop(0.5, 'rgb(  3, 162, 254)');
            main.addColorStop(0.5, 'rgb(  3, 162, 254)');
            main.addColorStop(1.0, 'rgb( 11, 172, 244)');
            foregroundColor = 'rgb(  0,   0,   0)';
            backgroundColor = 'rgba( 0,   0,   0, 0.1)';
        } else if (design == 'blue-darkblue') {
            main.addColorStop(0.0, 'rgb( 18,  33,  88)');
            main.addColorStop(0.005, 'rgb( 18,  33,  88)');
            main.addColorStop(0.5, 'rgb( 19,  30,  90)');
            main.addColorStop(0.5, 'rgb( 17,  31,  94)');
            main.addColorStop(1.0, 'rgb( 21,  25,  90)');
            foregroundColor = 'rgb( 23,  99, 221)';
            backgroundColor = 'rgba(23,  99, 221, 0.1)';
        } else if (design == 'blue-lightblue') {
            main.addColorStop(0.0, 'rgb( 88, 107, 132)');
            main.addColorStop(0.005, 'rgb( 53,  74, 104)');
            main.addColorStop(0.5, 'rgb( 27,  37,  65)');
            main.addColorStop(0.5, 'rgb(  5,  12,  40)');
            main.addColorStop(1.0, 'rgb( 32,  47,  79)');
            foregroundColor = 'rgb( 71, 178, 254)';
            backgroundColor = 'rgba(71, 178, 254, 0.1)';
        } else if (design == 'blue-gray') {
            main.addColorStop(0.0, 'rgb(135, 174, 255)');
            main.addColorStop(0.005, 'rgb(101, 159, 255)');
            main.addColorStop(0.5, 'rgb( 44,  93, 255)');
            main.addColorStop(0.5, 'rgb( 27,  65, 254)');
            main.addColorStop(1.0, 'rgb( 12,  50, 255)');
            foregroundColor = 'rgb(178, 180, 237)';
            backgroundColor = 'rgba(178, 180, 237, 0.1)';
        } else if (design == 'standard') {
            main.addColorStop(0.0, 'rgb(131, 133, 119)');
            main.addColorStop(0.005, 'rgb(176, 183, 167)');
            main.addColorStop(0.5, 'rgb(165, 174, 153)');
            main.addColorStop(0.5, 'rgb(166, 175, 156)');
            main.addColorStop(1.0, 'rgb(175, 184, 165)');
            foregroundColor = 'rgb( 35,  42,  52)';
            backgroundColor = 'rgba(35,  42,  52, 0.1)';
        } else if (design == 'lightgreen') {
            main.addColorStop(0.0, 'rgb(194, 212, 188)');
            main.addColorStop(0.005, 'rgb(212, 234, 206)');
            main.addColorStop(0.5, 'rgb(205, 224, 194)');
            main.addColorStop(0.5, 'rgb(206, 225, 194)');
            main.addColorStop(1.0, 'rgb(214, 233, 206)');
            foregroundColor = 'rgb(  0,  12,   6)';
            backgroundColor = 'rgba(0,   12,   6, 0.1)';
        } else if (design == 'standard-green') {
            main.addColorStop(0.0, 'rgb(255, 255, 255)');
            main.addColorStop(0.005, 'rgb(219, 230, 220)');
            main.addColorStop(0.5, 'rgb(179, 194, 178)');
            main.addColorStop(0.5, 'rgb(153, 176, 151)');
            main.addColorStop(1.0, 'rgb(114, 138, 109)');
            foregroundColor = 'rgb(  0,  12,   6)';
            backgroundColor = 'rgba(0,   12,   6, 0.1)';
        } else if (design == 'blue-blue') {
            main.addColorStop(0.0, 'rgb(100, 168, 253)');
            main.addColorStop(0.005, 'rgb(100, 168, 253)');
            main.addColorStop(0.5, 'rgb( 95, 160, 250)');
            main.addColorStop(0.5, 'rgb( 80, 144, 252)');
            main.addColorStop(1.0, 'rgb( 74, 134, 255)');
            foregroundColor = 'rgb(  0,  44, 187)';
            backgroundColor = 'rgba( 0,  44, 187, 0.1)';
        } else if (design == 'red-darkred') {
            main.addColorStop(0.0, 'rgb( 72,  36,  50)');
            main.addColorStop(0.005, 'rgb(185, 111, 110)');
            main.addColorStop(0.5, 'rgb(148,  66,  72)');
            main.addColorStop(0.5, 'rgb( 83,  19,  20)');
            main.addColorStop(1.0, 'rgb(  7,   6,  14)');
            foregroundColor = 'rgb(254, 139, 146)';
            backgroundColor = 'rgba(254, 139, 146, 0.1)';
        } else if (design == 'darkblue') {
            main.addColorStop(0.0, 'rgb( 14,  24,  31)');
            main.addColorStop(0.005, 'rgb( 46, 105, 144)');
            main.addColorStop(0.5, 'rgb( 19,  64,  96)');
            main.addColorStop(0.5, 'rgb(  6,  20,  29)');
            main.addColorStop(1.0, 'rgb(  8,   9,  10)');
            foregroundColor = 'rgb( 61, 179, 255)';
            backgroundColor = 'rgba(61, 179, 255, 0.1)';
        } else if (design == 'purple') {
            main.addColorStop(0.0, 'rgb(175, 164, 255)');
            main.addColorStop(0.005, 'rgb(188, 168, 253)');
            main.addColorStop(0.5, 'rgb(176, 159, 255)');
            main.addColorStop(0.5, 'rgb(174, 147, 252)');
            main.addColorStop(1.0, 'rgb(168, 136, 233)');
            foregroundColor = 'rgb(  7,  97,  72)';
            backgroundColor = 'rgba( 7,  97,  72, 0.1)';
        } else if (design == 'black-red') {
            main.addColorStop(0.0, 'rgb(  8,  12,  11)');
            main.addColorStop(0.005, 'rgb( 10,  11,  13)');
            main.addColorStop(0.5, 'rgb( 11,  10,  15)');
            main.addColorStop(0.5, 'rgb(  7,  13,   9)');
            main.addColorStop(1.0, 'rgb(  9,  13,  14)');
            foregroundColor = 'rgb(181,   0,  38)';
            backgroundColor = 'rgba(181,  0,  38, 0.1)';
        } else if (design == 'darkgreen') {
            main.addColorStop(0.0, 'rgb( 25,  85,   0)');
            main.addColorStop(0.005, 'rgb( 47, 154,   0)');
            main.addColorStop(0.5, 'rgb( 30, 101,   0)');
            main.addColorStop(0.5, 'rgb( 30, 101,   0)');
            main.addColorStop(1.0, 'rgb( 25,  85,   0)');
            foregroundColor = 'rgb( 35,  49,  35)';
            backgroundColor = 'rgba(35,  49,  35, 0.1)';
        } else if (design == 'amber') {
            main.addColorStop(0.0, 'rgb(182,  71,   0)');
            main.addColorStop(0.005, 'rgb(236, 155,  25)');
            main.addColorStop(0.5, 'rgb(212,  93,   5)');
            main.addColorStop(0.5, 'rgb(212,  93,   5)');
            main.addColorStop(1.0, 'rgb(182,  71,   0)');
            foregroundColor = 'rgb( 89,  58,  10)';
            backgroundColor = 'rgba(89,  58,  10, 0.1)';
        } else if (design == 'lightblue') {
            main.addColorStop(0.0, 'rgb(125, 146, 184)');
            main.addColorStop(0.005, 'rgb(197, 212, 231)');
            main.addColorStop(0.5, 'rgb(138, 155, 194)');
            main.addColorStop(0.5, 'rgb(138, 155, 194)');
            main.addColorStop(1.0, 'rgb(125, 146, 184)');
            foregroundColor = 'rgb(  9,   0,  81)';
            backgroundColor = 'rgba( 9,   0,  81, 0.1)';
        } else if (design == 'green-black') {
            main.addColorStop(0.0, 'rgb(  1,  47,   0)');
            main.addColorStop(0.005, 'rgb( 20, 106,  61)');
            main.addColorStop(0.5, 'rgb( 33, 125,  84)');
            main.addColorStop(0.5, 'rgb( 33, 125,  84)');
            main.addColorStop(1.0, 'rgb( 33, 109,  63)');
            foregroundColor = 'rgb(  3,  15,  11)';
            backgroundColor = 'rgba(3, 15, 11, 0.1)';
        } else if (design == 'yellow-black') {
            main.addColorStop(0.0, 'rgb(223, 248,  86)');
            main.addColorStop(0.005, 'rgb(222, 255,  28)');
            main.addColorStop(0.5, 'rgb(213, 245,  24)');
            main.addColorStop(0.5, 'rgb(213, 245,  24)');
            main.addColorStop(1.0, 'rgb(224, 248,  88)');
            foregroundColor = 'rgb(  9,  19,   0)';
            backgroundColor = 'rgba( 9,  19,   0, 0.1)';
        } else if (design == 'black-yellow') {
            main.addColorStop(0.0, 'rgb( 43,   3,   3)');
            main.addColorStop(0.005, 'rgb( 29,   0,   0)');
            main.addColorStop(0.5, 'rgb( 26,   2,   2)');
            main.addColorStop(0.5, 'rgb( 31,   5,   8)');
            main.addColorStop(1.0, 'rgb( 30,   1,   3)');
            foregroundColor = 'rgb(255, 254,  24)';
            backgroundColor = 'rgba(255, 254, 24, 0.1)';
        } else if (design == 'lightgreen-black') {
            main.addColorStop(0.0, 'rgb( 79, 121,  19)');
            main.addColorStop(0.005, 'rgb( 96, 169,   0)');
            main.addColorStop(0.5, 'rgb(120, 201,   2)');
            main.addColorStop(0.5, 'rgb(118, 201,   0)');
            main.addColorStop(1.0, 'rgb(105, 179,   4)');
            foregroundColor = 'rgb(  0,  35,   0)';
            backgroundColor = 'rgba( 0,  35,   0, 0.1)';
        } else if (design == 'darkpurple') {
            main.addColorStop(0.0, 'rgb( 35,  24,  75)');
            main.addColorStop(0.005, 'rgb( 42,  20, 111)');
            main.addColorStop(0.5, 'rgb( 40,  22, 103)');
            main.addColorStop(0.5, 'rgb( 40,  22, 103)');
            main.addColorStop(1.0, 'rgb( 41,  21, 111)');
            foregroundColor = 'rgb(158, 167, 210)';
            backgroundColor = 'rgba(158, 167, 210, 0.1)';
        } else if (design == 'darkamber') {
            main.addColorStop(0.0, 'rgb(134,  39,  17)');
            main.addColorStop(0.005, 'rgb(120,  24,   0)');
            main.addColorStop(0.5, 'rgb( 83,  15,  12)');
            main.addColorStop(0.5, 'rgb( 83,  15,  12)');
            main.addColorStop(1.0, 'rgb(120,  24,   0)');
            foregroundColor = 'rgb(233, 140,  44)';
            backgroundColor = 'rgba(233, 140, 44, 0.1)';
        } else if (design == 'blue-lightblue2') {
            main.addColorStop(0.0, 'rgb( 15,  84, 151)');
            main.addColorStop(0.005, 'rgb( 60, 103, 198)');
            main.addColorStop(0.5, 'rgb( 67, 109, 209)');
            main.addColorStop(0.5, 'rgb( 67, 109, 209)');
            main.addColorStop(1.0, 'rgb( 64, 101, 190)');
            foregroundColor = 'rgb(193, 253, 254)';
            backgroundColor = 'rgba(193, 253, 254, 0.1)';
        } else if (design == 'gray-purple') {
            main.addColorStop(0.0, 'rgb(153, 164, 161)');
            main.addColorStop(0.005, 'rgb(203, 215, 213)');
            main.addColorStop(0.5, 'rgb(202, 212, 211)');
            main.addColorStop(0.5, 'rgb(202, 212, 211)');
            main.addColorStop(1.0, 'rgb(198, 209, 213)');
            foregroundColor = 'rgb( 99, 124, 204)';
            backgroundColor = 'rgba(99, 124, 204, 0.1)';
        } else if (design == 'sections') {
            main.addColorStop(0.0, 'rgb(178, 178, 178)');
            main.addColorStop(0.005, 'rgb(255, 255, 255)');
            main.addColorStop(0.5, 'rgb(196, 196, 196)');
            main.addColorStop(0.5, 'rgb(196, 196, 196)');
            main.addColorStop(1.0, 'rgb(178, 178, 178)');
            foregroundColor = 'rgb(0, 0, 0)';
            backgroundColor = 'rgba(0, 0, 0, 0.1)';
        } else if (design == 'yoctopuce') {
            main.addColorStop(0.0, 'rgb(14, 24, 31)');
            main.addColorStop(0.005, 'rgb(35, 35, 65)');
            main.addColorStop(0.5, 'rgb(30, 30, 60)');
            main.addColorStop(0.5, 'rgb(30, 30, 60)');
            main.addColorStop(1.0, 'rgb(25, 25, 55)');
            foregroundColor = 'rgb(153, 229, 255)';
            backgroundColor = 'rgba(153,229,255, 0.1)';
        } else if (design == 'flat-turqoise') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 26, 188, 156)');
            main.addColorStop(0.005, 'rgb( 26, 188, 156)');
            main.addColorStop(0.5, 'rgb( 26, 188, 156)');
            main.addColorStop(0.5, 'rgb( 26, 188, 156)');
            main.addColorStop(1.0, 'rgb( 26, 188, 156)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-green-sea') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 26, 188, 156)');
            main.addColorStop(0.005, 'rgb( 26, 188, 156)');
            main.addColorStop(0.5, 'rgb( 26, 188, 156)');
            main.addColorStop(0.5, 'rgb( 26, 188, 156)');
            main.addColorStop(1.0, 'rgb( 26, 188, 156)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-emerland') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 46, 204, 113)');
            main.addColorStop(0.005, 'rgb( 46, 204, 113)');
            main.addColorStop(0.5, 'rgb( 46, 204, 113)');
            main.addColorStop(0.5, 'rgb( 46, 204, 113)');
            main.addColorStop(1.0, 'rgb( 46, 204, 113)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-nephritis') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 39, 174,  96)');
            main.addColorStop(0.005, 'rgb( 39, 174,  96)');
            main.addColorStop(0.5, 'rgb( 39, 174,  96)');
            main.addColorStop(0.5, 'rgb( 39, 174,  96)');
            main.addColorStop(1.0, 'rgb( 39, 174,  96)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-peter-river') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 52, 152, 219)');
            main.addColorStop(0.005, 'rgb( 52, 152, 219)');
            main.addColorStop(0.5, 'rgb( 52, 152, 219)');
            main.addColorStop(0.5, 'rgb( 52, 152, 219)');
            main.addColorStop(1.0, 'rgb( 52, 152, 219)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-belize-hole') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 41, 128, 185)');
            main.addColorStop(0.005, 'rgb( 41, 128, 185)');
            main.addColorStop(0.5, 'rgb( 41, 128, 185)');
            main.addColorStop(0.5, 'rgb( 41, 128, 185)');
            main.addColorStop(1.0, 'rgb( 41, 128, 185)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-amythyst') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(155,  89, 182)');
            main.addColorStop(0.005, 'rgb(155,  89, 182)');
            main.addColorStop(0.5, 'rgb(155,  89, 182)');
            main.addColorStop(0.5, 'rgb(155,  89, 182)');
            main.addColorStop(1.0, 'rgb(155,  89, 182)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-wisteria') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(142,  68, 173)');
            main.addColorStop(0.005, 'rgb(142,  68, 173)');
            main.addColorStop(0.5, 'rgb(142,  68, 173)');
            main.addColorStop(0.5, 'rgb(142,  68, 173)');
            main.addColorStop(1.0, 'rgb(142,  68, 173)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-sunflower') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(241, 196,  15)');
            main.addColorStop(0.005, 'rgb(241, 196,  15)');
            main.addColorStop(0.5, 'rgb(241, 196,  15)');
            main.addColorStop(0.5, 'rgb(241, 196,  15)');
            main.addColorStop(1.0, 'rgb(241, 196,  15)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-orange') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(243, 156,  18)');
            main.addColorStop(0.005, 'rgb(243, 156,  18)');
            main.addColorStop(0.5, 'rgb(243, 156,  18)');
            main.addColorStop(0.5, 'rgb(243, 156,  18)');
            main.addColorStop(1.0, 'rgb(243, 156,  18)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-carrot') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(230, 126,  34)');
            main.addColorStop(0.005, 'rgb(230, 126,  34)');
            main.addColorStop(0.5, 'rgb(230, 126,  34)');
            main.addColorStop(0.5, 'rgb(230, 126,  34)');
            main.addColorStop(1.0, 'rgb(230, 126,  34)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-pumpkin') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(211,  84,   0)');
            main.addColorStop(0.005, 'rgb(211,  84,   0)');
            main.addColorStop(0.5, 'rgb(211,  84,   0)');
            main.addColorStop(0.5, 'rgb(211,  84,   0)');
            main.addColorStop(1.0, 'rgb(211,  84,   0)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-alizarin') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(231,  76,  60)');
            main.addColorStop(0.005, 'rgb(231,  76,  60)');
            main.addColorStop(0.5, 'rgb(231,  76,  60)');
            main.addColorStop(0.5, 'rgb(231,  76,  60)');
            main.addColorStop(1.0, 'rgb(231,  76,  60)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-pomegranate') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(192,  57,  43)');
            main.addColorStop(0.005, 'rgb(192,  57,  43)');
            main.addColorStop(0.5, 'rgb(192,  57,  43)');
            main.addColorStop(0.5, 'rgb(192,  57,  43)');
            main.addColorStop(1.0, 'rgb(192,  57,  43)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-clouds') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(236, 240, 241)');
            main.addColorStop(0.005, 'rgb(236, 240, 241)');
            main.addColorStop(0.5, 'rgb(236, 240, 241)');
            main.addColorStop(0.5, 'rgb(236, 240, 241)');
            main.addColorStop(1.0, 'rgb(236, 240, 241)');
            foregroundColor = 'rgb(  0,   0,   0)';
            backgroundColor = 'rgba(  0,   0,   0, 0.1)';
        } else if (design == 'flat-silver') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(189, 195, 199)');
            main.addColorStop(0.005, 'rgb(189, 195, 199)');
            main.addColorStop(0.5, 'rgb(189, 195, 199)');
            main.addColorStop(0.5, 'rgb(189, 195, 199)');
            main.addColorStop(1.0, 'rgb(189, 195, 199)');
            foregroundColor = 'rgb(  0,   0,   0)';
            backgroundColor = 'rgba(  0,   0,   0, 0.1)';
        } else if (design == 'flat-concrete') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(149, 165, 166)');
            main.addColorStop(0.005, 'rgb(149, 165, 166)');
            main.addColorStop(0.5, 'rgb(149, 165, 166)');
            main.addColorStop(0.5, 'rgb(149, 165, 166)');
            main.addColorStop(1.0, 'rgb(149, 165, 166)');
            foregroundColor = 'rgb(  0,   0,   0)';
            backgroundColor = 'rgba(  0,   0,   0, 0.1)';
        } else if (design == 'flat-asbestos') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb(127, 140, 141)');
            main.addColorStop(0.005, 'rgb(127, 140, 141)');
            main.addColorStop(0.5, 'rgb(127, 140, 141)');
            main.addColorStop(0.5, 'rgb(127, 140, 141)');
            main.addColorStop(1.0, 'rgb(127, 140, 141)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-wet-asphalt') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 52,  73,  94)');
            main.addColorStop(0.005, 'rgb( 52,  73,  94)');
            main.addColorStop(0.5, 'rgb( 52,  73,  94)');
            main.addColorStop(0.5, 'rgb( 52,  73,  94)');
            main.addColorStop(1.0, 'rgb( 52,  73,  94)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else if (design == 'flat-midnight-blue') {
            frame = 'rgb(255, 255, 255)';
            main.addColorStop(0.0, 'rgb( 44,  62,  80)');
            main.addColorStop(0.005, 'rgb( 44,  62,  80)');
            main.addColorStop(0.5, 'rgb( 44,  62,  80)');
            main.addColorStop(0.5, 'rgb( 44,  62,  80)');
            main.addColorStop(1.0, 'rgb( 44,  62,  80)');
            foregroundColor = 'rgb(255, 255, 255)';
            backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            main.addColorStop(0.0, 'rgb(131, 133, 119)');
            main.addColorStop(0.005, 'rgb(176, 183, 167)');
            main.addColorStop(0.5, 'rgb(165, 174, 153)');
            main.addColorStop(0.5, 'rgb(166, 175, 156)');
            main.addColorStop(1.0, 'rgb(175, 184, 165)');
            foregroundColor = 'rgb( 35,  42,  52)';
            backgroundColor = 'rgba(35,  42,  52, 0.1)';
        }

        //frame
        roundedRectangle(ctx, 0, 0, width, height, radius);
        ctx.fillStyle   = frame;
        ctx.strokeStyle = 'transparent';
        ctx.fill();
        
        //main
        roundedRectangle(ctx, 1, 1, width - 2, height - 2, 0.0833333333 * height);
        ctx.fillStyle   = main;
        ctx.strokeStyle = 'transparent';
        ctx.fill();

        //crystal effect
        if (crystalEffectVisible) {
	        roundedRectangle(ctx, 2, 2, width - 4, height - 4, 0.0833333333 * height);
	        ctx.clip();

	        var darkNoise   = 'rgba(100, 100, 100, '; //, 0.10)';
	        var brightNoise = 'rgba(200, 200, 200, '; //, 0.05)';
	        var color;
	        var noiseAlpha;
	        for (var y = 0 ; y < height ; y++) {
	            for (var x = 0 ; x < width ; x++) {
	                color = Math.floor(Math.random()) == 0 ? darkNoise : brightNoise;
	                noiseAlpha = clamp(0, 1, 0.04 + Math.random() * 0.08);
	                ctx.fillStyle = color + noiseAlpha + ')';
	                ctx.fillRect(x, y, 1, 1);
	            }
	        }
    	}
    }

    var drawText = function() {
        var ctx    = textBuffer.getContext("2d");
        var width  = textBuffer.width;
        var height = textBuffer.height;

        ctx.clearRect(0, 0, width, height);
        
        lcdFontHeight = Math.floor(0.5833333333 * height);
        lcdFont = lcdFontHeight + 'px ' + LCD_FONT_NAME;

        lcdUnitFont  = Math.floor(0.26 * height) + 'px ' + STD_FONT_NAME;
        lcdTitleFont = Math.floor(0.1666666667 * height) + 'px ' + STD_FONT_NAME;
        lcdSmallFont = Math.floor(0.1666666667 * height) + 'px ' + STD_FONT_NAME;

        ctx.font = lcdUnitFont;
        var unitWidth = ctx.measureText(unit).width;
        ctx.font = lcdFont;
        var textWidth = ctx.measureText(Number(value).toFixed(2)).width;

        // calculate background text
        var oneSegmentWidth = ctx.measureText('8').width;

        // Width of decimals
        var widthOfDecimals = decimals == 0 ? 0 : decimals * oneSegmentWidth + oneSegmentWidth;

        // Available width
        var availableWidth = width - 2 - (unitWidth + height * 0.0833333333) - widthOfDecimals;

        // Number of segments
        var noOfSegments = Math.floor(availableWidth / oneSegmentWidth);

        // Add segments to background text
        var backgroundText = '';
        var count = 0;
        for (var i = 0 ; i < noOfSegments ; i++) {
            backgroundText += '8';
        }
        if (decimals != 0) {
            backgroundText += ".";
            for (var i = 0 ; i < decimals ; i++) {
                backgroundText += '8';
            }
        }
        var backgroundWidth = ctx.measureText(backgroundText).width;

        //dropshadow
        if (foregroundShadowEnabled) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur    = 2;
            ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
        }

        //valueBackground
        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.font = lcdFont;
        ctx.textBaseline = 'bottom';
        if (unitVisible) {
            ctx.fillText(backgroundText, width - 2 - backgroundWidth - (unitWidth + height * 0.0833333333), 0.77 * height);
        } else {
            ctx.fillText(backgroundText, width - 2 - backgroundWidth - height * 0.0833333333, 0.77 * height);
        }

        ctx.fillStyle = foregroundColor;

        //valueText
        ctx.font = lcdFont;
        ctx.textBaseline = 'bottom';
        if (unitVisible) {
            ctx.fillText(Number(value).toFixed(decimals), width - 2 - textWidth - (unitWidth + height * 0.0833333333), 0.77 * height);
        } else {
            ctx.fillText(Number(value).toFixed(decimals), width - 2 - textWidth - height * 0.0833333333, 0.77 * height);
        }

        //unitText
        if (unitVisible) {
            ctx.fill();
            ctx.font = lcdUnitFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(unit, width - unitWidth - 0.04 * height, 0.745 * height);            
        }

        //lowerCenterText
        if (lowerCenterTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(lowerCenterText).toFixed(decimals), (width - ctx.measureText(Number(lowerCenterText).toFixed(2)).width) * 0.5, 0.98 * height);
        }

        //upperLeftText
        if (upperLeftTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(upperLeftText).toFixed(decimals), 0.0416666667 * height, 0.23 * height);
        }

        //upperRightText
        if (upperRightTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(Number(upperRightText).toFixed(decimals), width - 0.0416666667 * height - ctx.measureText(Number(upperRightText).toFixed(2)).width, 0.23 * height);
        }

        //upperCenterText
        if (upperCenterTextVisible) {
            ctx.font = 'bold ' + lcdTitleFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(upperCenterText, (width - ctx.measureText(upperCenterText).width) * 0.5, 0.23 * height);
        }

        //lowerRightText
        if (lowerRightTextVisible) {
            ctx.font = lcdSmallFont;
            ctx.textBaseline = 'bottom';
            ctx.fillText(lowerRightText, width - 0.0416666667 * height - ctx.measureText(lowerRightText).width, 0.98 * height);
        }
    }

    var drawIcons = function() {
        var ctx    = iconsBuffer.getContext("2d");
        var width  = iconsBuffer.width;
        var height = iconsBuffer.height;

        ctx.clearRect(0, 0, width, height);

        //dropshadow
        if (foregroundShadowEnabled) {
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur    = 2;
            ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
        }
        
        ctx.fillStyle = foregroundColor;

        if (thresholdVisible) {
            //threshold
            ctx.beginPath();
            ctx.moveTo(0.07575757575757576 * width, 0.8958333333333334 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.8958333333333334 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.9166666666666666 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.9166666666666666 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.8958333333333334 * height);
            ctx.closePath();
            ctx.moveTo(0.07575757575757576 * width, 0.8125 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.8125 * height);
            ctx.lineTo(0.08333333333333333 * width, 0.875 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.875 * height);
            ctx.lineTo(0.07575757575757576 * width, 0.8125 * height);
            ctx.closePath();
            ctx.moveTo(0.11363636363636363 * width, 0.9375 * height);
            ctx.lineTo(0.08 * width, 0.75 * height);
            ctx.lineTo(0.045454545454545456 * width, 0.9375 * height);
            //ctx.lineTo(0.11363636363636363 * width, 0.9375 * height);
            ctx.closePath();
            ctx.fill();
        }

        if (trendVisible) {
            if (trend === 'down') {
                //trendDown
                ctx.beginPath();
                ctx.moveTo(0.18181818181818182 * width, 0.8125 * height);
                ctx.lineTo(0.21212121212121213 * width, 0.9375 * height);
                ctx.lineTo(0.24242424242424243 * width, 0.8125 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.8125 * height);
                ctx.closePath();
                ctx.fill();
            } else if (trend === 'falling') {
                //trendFalling
                ctx.beginPath();
                ctx.moveTo(0.18181818181818182 * width, 0.8958333333333334 * height);
                ctx.lineTo(0.24242424242424243 * width, 0.9375 * height);
                ctx.lineTo(0.20454545454545456 * width, 0.8125 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.8958333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (trend === 'steady') {
                //trendSteady
                ctx.beginPath();
                ctx.moveTo(0.18181818181818182 * width, 0.8125 * height);
                ctx.lineTo(0.24242424242424243 * width, 0.875 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.9375 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.8125 * height);
                ctx.closePath();
                ctx.fill();
            } else if (trend === 'rising') {
                //trendRising
                ctx.beginPath();
                ctx.moveTo(0.18181818181818182 * width, 0.8541666666666666 * height);
                ctx.lineTo(0.24242424242424243 * width, 0.8125 * height);
                ctx.lineTo(0.20454545454545456 * width, 0.9375 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.8541666666666666 * height);
                ctx.closePath();
                ctx.fill();
            } else if (trend === 'up') {
                //trendUp
                ctx.beginPath();
                ctx.moveTo(0.18181818181818182 * width, 0.9375 * height);
                ctx.lineTo(0.21212121212121213 * width, 0.8125 * height);
                ctx.lineTo(0.24242424242424243 * width, 0.9375 * height);
                ctx.lineTo(0.18181818181818182 * width, 0.9375 * height);
                ctx.closePath();
                ctx.fill();
            }
        }

        if (batteryVisible) {
            if (battery === 'empty') {
            //empty
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 'onethird') {
                // 30%
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 'twothirds') {
                // 60%
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            } else if (battery === 'full') {
                //battery_1
                ctx.beginPath();
                ctx.moveTo(0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9166666666666666 * height, 0.803030303030303 * width, 0.9375 * height, 0.803030303030303 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9583333333333334 * height, 0.7954545454545454 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height, 0.6742424242424242 * width, 0.9583333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9583333333333334 * height, 0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.9375 * height, 0.6666666666666666 * width, 0.8125 * height, 0.6666666666666666 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6666666666666666 * width, 0.8125 * height, 0.6742424242424242 * width, 0.7916666666666666 * height, 0.6742424242424242 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height, 0.7954545454545454 * width, 0.7916666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.7916666666666666 * height, 0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8125 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.803030303030303 * width, 0.8333333333333334 * height, 0.803030303030303 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8333333333333334 * height, 0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8541666666666666 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8541666666666666 * height, 0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.8958333333333334 * height);
                ctx.bezierCurveTo(0.8106060606060606 * width, 0.8958333333333334 * height, 0.8106060606060606 * width, 0.9166666666666666 * height, 0.8106060606060606 * width, 0.9166666666666666 * height);
                ctx.closePath();
                ctx.moveTo(0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.8125 * height, 0.7954545454545454 * width, 0.8125 * height, 0.7878787878787878 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.7878787878787878 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height, 0.6818181818181818 * width, 0.8125 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8125 * height, 0.6742424242424242 * width, 0.8333333333333334 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.8333333333333334 * height, 0.6742424242424242 * width, 0.9166666666666666 * height, 0.6742424242424242 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.6742424242424242 * width, 0.9375 * height, 0.6742424242424242 * width, 0.9375 * height, 0.6818181818181818 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.6818181818181818 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height, 0.7878787878787878 * width, 0.9375 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9375 * height, 0.7954545454545454 * width, 0.9166666666666666 * height);
                ctx.bezierCurveTo(0.7954545454545454 * width, 0.9166666666666666 * height, 0.7954545454545454 * width, 0.8333333333333334 * height, 0.7954545454545454 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7575757575757576 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7878787878787878 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7878787878787878 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7575757575757576 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7575757575757576 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.75 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.7196969696969697 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.moveTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.8333333333333334 * height);
                ctx.lineTo(0.7121212121212122 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.9166666666666666 * height);
                ctx.lineTo(0.6818181818181818 * width, 0.8333333333333334 * height);
                ctx.closePath();
                ctx.fill();
            }
        }
    }
         
    function clamp(min, max, value) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function roundedRectangle(ctx, x, y, w, h, radius) {
        var r = x + w,
            b = y + h;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + h - radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.stroke();
    }

    function onResize(){        
        if (scalable) {
            width  = window.innerWidth * 0.8;
            height = window.innerHeight * 0.8;
        }

        canvas.width  = width;
        canvas.height = height;

        lcdBuffer.width    = width;
        lcdBuffer.height   = height;
        textBuffer.width   = width;
        textBuffer.height  = height;
        iconsBuffer.width  = width;
        iconsBuffer.height = height;

        mainCtx.canvas.width  = canvas.width;
        mainCtx.canvas.height = canvas.height;

        drawLcd();
        drawText();
        drawIcons();

        repaint();
    }

    function repaint() {
        mainCtx.clearRect(0, 0, canvas.width, canvas.height);
        mainCtx.drawImage(lcdBuffer, 0, 0);
        mainCtx.drawImage(textBuffer, 0, 0);
        mainCtx.drawImage(iconsBuffer, 0, 0);
    }


    // ******************** public methods ************************************
    this.setValue = function(newValue) {
		formerValue     = value;
        lowerCenterText = Number(value).toFixed(decimals);
        value           = Number(newValue).toFixed(decimals);
        if (value < upperLeftText) {
            upperLeftText = Number(value).toFixed(decimals);
        }
        if (value > upperRightText) {
            upperRightText = Number(value).toFixed(decimals);
        }
        thresholdVisible = value > threshold ? true : false;

        var delta = value - formerValue;
        if (delta >= 1.0) {
            trend = 'up';
        } else if (delta < 1.0 && delta > 0.1) {
            trend = 'rising';
        } else if (delta <= -1) {
            trend = 'down';
        } else if (delta > -1 && delta < -0.1) {
            trend = 'falling';
        } else {
            trend = 'steady';
        }
        drawText();
        drawIcons();

        repaint();
    }

    this.setDesign = function(newDesign) {
        design = newDesign;
        onResize();
    } 
     
    this.setUpperCenterText = function(text) {
        upperCenterText = text;
        drawText();
        repaint();
    }

    this.setLowerRightText = function(text) {
        lowerRightText = text;
        drawText();
        repaint();
    }

    this.setUnit = function(text) {
        unit = text;
        drawText();
        repaint();
    }

    this.setSize = function(newWidth, newHeight) {
        width  = newWidth;
        height = newHeight;
        onResize();
    }

    this.update = function(newValue, newAbsMin, newAbsMax) {
        upperLeftText   = Number(newAbsMin).toFixed(decimals);
        upperRightText  = Number(newAbsMax).toFixed(decimals);
        lowerCenterText = Number(value).toFixed(decimals);
        formerValue     = value;
        value           = Number(newValue).toFixed(decimals);

        thresholdVisible = value > threshold ? true : false;

        var delta = value - formerValue;
        if (delta >= 1.0) {
            trend = 'up';
        } else if (delta < 1.0 && delta > 0.1) {
            trend = 'rising';
        } else if (delta <= -1) {
            trend = 'down';
        } else if (delta > -1 && delta < -0.1) {
            trend = 'falling';
        } else {
            trend = 'steady';
        }
        drawText();
        drawIcons();

        repaint();
    }

    // initial paint
    onResize();
}
