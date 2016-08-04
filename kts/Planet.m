//
//  Planet.m
//  Kick the Stars
//
//  Created by Szabó Bendegúz on 02/06/14.
//  Copyright (c) 2014 User. All rights reserved.
//

#import "Planet.h"

#import "MathLibrary.h"
#import "PlistManager.h"

#import "CGVector+TC.h"
#import "UIColor+HEX.h"
#import "NSArray+RandomObject.h"

const float POINTS_LABEL_MINIMUM_SCALE = 0.35;

#define ENEMY_HEX "#009900"
#define ENEMY_MARKER_HEX "#009900"
#define INDEPENDENT_HEX "#999999"
#define INDEPENDENT_MARKER_HEX "#999999"
#define FRIENDLY_MARKER_HEX "#FFFFFF"


const int MAX_RADIUS = 25;

const int MAP_MARGIN = 10;

const int OUTER_MAP_SIZE = 500 / 2 - MAP_MARGIN;

const int SUN_CATCHMENT_AREA = 21;

@implementation Planet {
    SKSpriteNode *orb, *light;
    SKShapeNode *loader, *marker, *aimLine;
    SKLabelNode *pointsLabel;
    
    NSMutableArray *orbit;
    
    UIColor *mainColor;
}
//    NSArray *array = [NSArray arrayWithObjects:[UIColor colorWithHexString:@"#90a959"], [UIColor colorWithHexString:@"#7db9e8"], [UIColor colorWithHexString:@"#aa759f"], [UIColor colorWithHexString:@"#ac4142"], [UIColor colorWithHexString:@"#f4bf75"], nil];
//    int id1 = (int)(scale * array.count - 1), id2 = id1 < array.count - 1 ? id1 + 1 : id1;
//    mainColor = colorBetween((UIColor *)array[id1], (UIColor *)array[id2], scale * (array.count - 1) - id1);

- (void)createIn:(CGPoint)position as:(PlanetType)type skin:(NSString *)skin {
    self.position = position;
    mainColor =  [UIColor colorWithHexString:[[[PlistManager read:@"singleplayer_colors"] allValues] randomString]];
    UIColor *color = [self colorFor:type];
    
//asd    orb = [SKSpriteNode spriteNodeWithImageNamed:skin];
//    orb = [SKSpriteNode sprite];
//    orb.size = CGSizeMake(MAX_RADIUS, MAX_RADIUS);
//    orb.color = color;
//asd    orb.colorBlendFactor = 1;
//    [orb runAction:[SKAction repeatActionForever:[SKAction rotateByAngle:1 duration:1]]];
//    [self addChild:orb];
    
    light = [SKSpriteNode spriteNodeWithImageNamed:@"planet_light"];
    light.size = CGSizeMake(MAX_RADIUS, MAX_RADIUS);
    light.color = color;
    light.colorBlendFactor = 0.5;
    light.blendMode = SKBlendModeAdd;
    [self addChild:light];
    
    pointsLabel = [SKLabelNode labelNodeWithFontNamed:@"PTSerif-Regular"];
    [self addChild:pointsLabel];
    
    marker = [[SKShapeNode alloc] init];
    CGMutablePathRef circle = CGPathCreateMutable();
    CGPathAddArc(circle, NULL, 0, 0, MAX_RADIUS, 0, M_PI * 2, YES);
    marker.path = circle;
    CGPathRelease(circle);
    marker.lineWidth = 2;
    marker.strokeColor = [SKColor whiteColor];
    marker.zPosition = -1;
    [self addChild:marker];
    
    [self setType:type];
    [self setScaleTo:0.1];
    if (type != INDEPENDENT) {
        loader = [[SKShapeNode alloc] init];
        loader.lineWidth = 2;
        loader.strokeColor = [SKColor blackColor];
        loader.zPosition = 1;
        CGMutablePathRef circle = CGPathCreateMutable();
        CGPathAddArc(circle, NULL, 0, 0, MAX_RADIUS, 0, M_PI * 2, YES);
        loader.path = circle;
        CGPathRelease(circle);
        [self addChild:loader];
        
    } else {
        [marker setScale:0.5];
        [marker setHidden:YES];
        [pointsLabel setAlpha:0.5];
        
        self.selected = NO;
    }
}

- (void)setLoadingTo:(float)percent {
    marker.zPosition = 1;
    
    CGMutablePathRef circle = CGPathCreateMutable();
    CGPathAddArc(circle, NULL, 0, 0, MAX_RADIUS, 0, M_PI * 2 * percent, YES);
    loader.path = circle;
    CGPathRelease(circle);
}

- (void)finishLoading:(SKNode *)sun {
    [self removeActionForKey:@"planetCreating"];
    [self pushoutFromSun:sun];
    [self setSelected];
    
    [marker runAction:[SKAction scaleTo:0.5 duration:0.15] completion:^{
        marker.zPosition = -1;
    }];
    [loader runAction:[SKAction group:@[[SKAction scaleTo:0.5 duration:0.15], [SKAction fadeAlphaTo:0 duration:0.15]]] completion:^{
        [loader removeFromParent];
    }];
}

- (void)setLightDistance:(float)distance radians:(float)radians {
    float lightOpacity = distance < OUTER_MAP_SIZE ? 1 - distance / OUTER_MAP_SIZE : 0;
    
    [light runAction:[SKAction fadeAlphaTo:lightOpacity duration:0]];
    light.zRotation = radians - 1.57079633;
}

- (void)pushoutFromSun:(SKNode *)sun {
    CGVector diff = TCVectorMinus(self.position, sun.position);
    CGFloat r = TCVectorLength(diff);
    CGFloat G = 3000000;
    CGVector normalized = TCVectorUnit(diff);
    normalized = CGVectorMake(normalized.dy * -1, normalized.dx);
    CGFloat speed = sqrt(G * 1 / r);
    [self.physicsBody setVelocity:TCVectorMultiply(normalized, speed)];
}

- (void)setScaleTo:(float)scale {
    self.scale = scale;
    self.radius = (MAX_RADIUS * scale) / 2.9;
    
    self.physicsBody = [SKPhysicsBody bodyWithCircleOfRadius:(MAX_RADIUS * scale) / 2.9];
    self.physicsBody.allowsRotation = NO;
    if (self.planetType == INDEPENDENT) {
        self.physicsBody.dynamic = NO;
    }
    
    [pointsLabel setScale:scale];
    [pointsLabel setHidden:(scale < POINTS_LABEL_MINIMUM_SCALE) ? YES : NO];
//    [self setPointsTo:100 * scale];
    
    [light setScale:scale];
    [orb setScale:scale];
}

- (void)setPointsTo:(float)p {
    self.points = p;
    if (!pointsLabel.hidden) {
        [self setText];
    }
}

- (void)setPointsBy:(float)p {
    self.points += p;
    if (!pointsLabel.hidden) {
        [self setText];
    }
}

- (void)setText {
    switch ([NSString stringWithFormat:@"%i", (int)_points].length) {
        case 1:
            pointsLabel.fontSize = 25;
            break;
        case 2:
            pointsLabel.fontSize = 21;
            break;
        case 3:
            pointsLabel.fontSize = 17;
            break;
        case 4:
            pointsLabel.fontSize = 13;
            break;
    }
    
    pointsLabel.position = CGPointMake(0, -(_scale * pointsLabel.fontSize) / 2.5);
    pointsLabel.text = [NSString stringWithFormat:@"%i", (int)_points];
}

- (void)setSelected {
    _selected = YES;
    marker.hidden = NO;
    [pointsLabel runAction:[SKAction fadeAlphaTo:1 duration:0.12]];
    if (_planetType == FRIENDLY && _scale < POINTS_LABEL_MINIMUM_SCALE) {
        pointsLabel.hidden = NO;
        [pointsLabel runAction:[SKAction scaleTo:0.5 duration:0.12]];
    }
}

- (void)setDeselected {
    self.selected = NO;
    marker.hidden = YES;
    if (self.scale < POINTS_LABEL_MINIMUM_SCALE) {
        [pointsLabel runAction:[SKAction group:@[[SKAction fadeAlphaTo:0 duration:0.12], [SKAction scaleTo:0 duration:0.12]]] completion:^{
            pointsLabel.hidden = YES;
        }];
    } else {
        [pointsLabel runAction:[SKAction fadeAlphaTo:0.5 duration:0.12]];
    }
}

- (void)setType:(PlanetType)planetType {
    self.planetType = planetType;
    switch (planetType) {
        case FRIENDLY:
            [marker setStrokeColor:[UIColor colorWithHexString:@FRIENDLY_MARKER_HEX]];
            break;
        case ENEMY:
            [marker setStrokeColor:[UIColor colorWithHexString:@ENEMY_MARKER_HEX]];
            break;
        case INDEPENDENT:
            [marker setStrokeColor:[UIColor colorWithHexString:@INDEPENDENT_MARKER_HEX]];
            break;
    }
}

- (UIColor *)colorFor:(PlanetType)pT {
    UIColor *r;
    switch (pT) {
        case FRIENDLY:
            r = mainColor;
            break;
        case ENEMY:
            r = [UIColor colorWithHexString:@ENEMY_HEX];
            break;
        case INDEPENDENT:
            r = [UIColor colorWithHexString:@INDEPENDENT_HEX];
            break;
    }
    return r;
}

- (void)hitBy:(Unit *)unit {
    float duration = 0.3;
    if (self.planetType == FRIENDLY) {
        // support with units
        [self runAction:[SKAction playSoundFileNamed:@"support.mp3" waitForCompletion:NO]];
        [self setPointsBy:unit.points];
        
        [orb runAction:[SKAction sequence:@[[SKAction colorizeWithColor:[UIColor whiteColor] colorBlendFactor:1 duration:duration / 2], [SKAction colorizeWithColor:[self colorFor:self.planetType] colorBlendFactor:1 duration:duration / 2]]]];
    } else if (self.points > unit.points) {
        // hit by units
        [self runAction:[SKAction playSoundFileNamed:@"hit.wav" waitForCompletion:NO]];
        [self setPointsBy:-unit.points];
        
        [orb runAction:[SKAction sequence:@[[SKAction colorizeWithColor:[UIColor whiteColor] colorBlendFactor:1 duration:duration / 2], [SKAction colorizeWithColor:[self colorFor:self.planetType] colorBlendFactor:1 duration:duration / 2]]]];
    } else {
        // conquer, then support with units
        [self setPointsTo:ABS(self.points - unit.points)];
        [self changePriorityTo:unit.origin.planetType];
    }
}

- (void)search:(CGPoint)p {
    _hasSearch = YES;
    if (!aimLine) {
        aimLine = [SKShapeNode node];
        aimLine.zPosition = -1;
        aimLine.lineWidth = 0.3;

        [self addChild:aimLine];
    }
    
    CGMutablePathRef path = CGPathCreateMutable();

    CGPoint p1 = pointInCircle(CGPointMake(0, 0), 25, radiansBetween(self.position, p));

    CGPathMoveToPoint(path, NULL, p1.x, p1.y);
    CGPathAddLineToPoint(path, NULL, p.x - self.position.x, p.y - self.position.y);

    aimLine.path = CGPathCreateCopyByDashingPath(path, NULL, 0, (CGFloat[]){6, 9}, 2);

    CGPathRelease(path);
}

- (void)endSearch {
    _hasSearch = NO;
    [aimLine removeFromParent];
    aimLine = nil;
}

- (void)aim:(Planet *)p {
    if (!aimLine) {
        aimLine = [SKShapeNode node];
        aimLine.zPosition = -1;
        aimLine.lineWidth = 0.3;
        
        [self addChild:aimLine];
    }
    
    CGMutablePathRef path = CGPathCreateMutable();
    
    float r = radiansBetween(self.position, p.position);
    
    CGPoint p1 = pointInCircle(CGPointMake(0, 0), 25, r);
    CGPoint p2 = pointInCircle(p.position, -25, r);
    
    CGPathMoveToPoint(path, NULL, p1.x, p1.y);
    CGPathAddLineToPoint(path, NULL, p2.x - self.position.x, p2.y - self.position.y);
    
    aimLine.path = CGPathCreateCopyByDashingPath(path, NULL, 0, (CGFloat[]){6, 9}, 2);
    
    CGPathRelease(path);
}

- (void)removeAim {
    if (_hasSearch != YES && aimLine) {
        [aimLine removeFromParent];
        aimLine = nil;
    }
}

- (void)changePriorityTo:(PlanetType)planetType {
    float duration = 0.3;
    if (self.selected && self.planetType != FRIENDLY && planetType == FRIENDLY) {
        [self setType:planetType];
        [self setSelected];
    } else {
        [self setType:planetType];
        [self setDeselected];
    }
    
    [self runAction:[SKAction playSoundFileNamed:@"conquer.wav" waitForCompletion:NO]];
    [orb runAction:[SKAction sequence:@[[SKAction colorizeWithColor:[UIColor whiteColor] colorBlendFactor:1 duration:duration / 2], [SKAction colorizeWithColor:[self colorFor:planetType] colorBlendFactor:1 duration:duration / 2]]]];
}

- (void)sync:(Planet *)p {
    CGVector diff = TCVectorMinus(p.position, self.position);
    CGVector normalized = TCVectorUnit(diff);
    CGFloat r = TCVectorLength(diff);
    CGFloat G = 3000000;
    CGFloat actualMass = self.physicsBody.mass;
    if (actualMass == 0) {
        actualMass = 1;
    }
    CGFloat otherMass = p.physicsBody.mass;
    if (otherMass == 0) {
        otherMass = 1;
    }
    CGFloat forceMultiplyer = G * actualMass * otherMass / r / r;
    CGVector force = TCVectorMultiply(normalized, forceMultiplyer);
    if (r> 30) {
        [self.physicsBody applyForce:force];
    }
}

@end
