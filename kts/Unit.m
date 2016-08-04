//
//  UnitBlock.m
//  Kick the Stars
//
//  Created by Szabó Bendegúz on 03/06/14.
//  Copyright (c) 2014 User. All rights reserved.
//

#import "Unit.h"
#import "MathLibrary.h"
#import "CGVector+TC.h"

@implementation Unit {
    CGPoint lastPosition;
    BOOL fastMode;
}

- (void)createFor:(Planet *)planet points:(float)points target:(Planet *)target color:(UIColor *)c level:(NSInteger)level {
    self.position = pointInCircle(planet.position, planet.radius, radiansBetween(planet.position, target.position));
    lastPosition = self.position;
    self.points = points;
    self.origin = planet;
    self.target = target;

    CGMutablePathRef path = CGPathCreateMutable();
    
    float scale = 2.5 + level;
    self.radius = scale;
    CGPathMoveToPoint(path, NULL, 0, scale);
    CGPathAddLineToPoint(path, NULL, -scale, -scale);
    CGPathAddLineToPoint(path, NULL, scale, -scale);
    CGPathCloseSubpath(path);

    SKShapeNode *unit = [SKShapeNode node];
    unit.lineWidth = 0.25;
    unit.strokeColor = c;
    unit.path = path;
    [self addChild:unit];
    
//asd    SKSpriteNode *lightEffect = [SKSpriteNode spriteNodeWithImageNamed:@"sun_light.png"];
//asd    [lightEffect setScale:0.05];
//asd    [lightEffect setAlpha:0.8];
//asd    [lightEffect setColor:c];
//asd    [lightEffect setColorBlendFactor:1];
//asd    [self addChild:lightEffect];
    
    self.physicsBody = [SKPhysicsBody bodyWithPolygonFromPath:path];
    self.physicsBody.mass = 0.00001;
    self.physicsBody.allowsRotation = NO;
    
    CGPathRelease(path);
}

- (void)sync:(float)distance {
    if (!fastMode && distance < MAX_RADIUS / 2) {
        fastMode = YES;
    }
    [self.physicsBody applyForce:TCVectorMultiply(TCVectorUnit(TCVectorMinus(_target.position, self.position)), (fastMode) ? 21 : 0.12)];
    if (distanceBetween(lastPosition, self.position) > 1.5) {
        self.zRotation = radiansBetween(lastPosition, self.position) + 1.57079633;
        lastPosition = self.position;
    }
}

@end
