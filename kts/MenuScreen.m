////
////  MenuScreen.m
////  Kick the Stars
////
////  Created by Szabó Bendegúz on 18/06/14.
////  Copyright (c) 2014 User. All rights reserved.
////
//
//#import "MenuScreen.h"
//
//@implementation MenuScreen {
//    SKSpriteNode *start, *restart;
//}
//
//- (MenuScreen *)initFirstMenuIn:(SKScene *)scene {
//    SKSpriteNode *logo = [self imageFor:LOGO withHeight:70];
//    [logo setPosition:CGPointMake(scene.size.width / 2, scene.size.height / 1.32)];
//    [self addChild:logo];
//    
//    start = [self imageFor:START withHeight:40];
//    [start setPosition:CGPointMake(scene.size.width / 2, scene.size.height / 2)];
//    [self addChild:start];
//    
//    [scene addChild:self];
//    return self;
//}
//
//- (MenuScreen *)initPauseMenuIn:(SKScene *)scene {
//    SKSpriteNode *background = [SKSpriteNode spriteNodeWithTexture:[SKTexture textureWithImage:[self getScreenshotWithBlur:@7.5 scene:scene]]];
//    [background setPosition: CGPointMake(scene.size.width / 2, scene.size.height / 2)];
//    [self addChild:background];
//    
//    SKSpriteNode *logo = [self imageFor:LOGO withHeight:70];
//    [logo setPosition:CGPointMake(scene.size.width / 2, scene.size.height / 1.32)];
//    [self addChild:logo];
//    
//    restart = [self imageFor:RESTART withHeight:40];
//    [restart setPosition:CGPointMake(scene.size.width / 2, scene.size.height / 2)];
//    [self addChild:restart];
//    
//    [scene addChild:self];
//    return self;
//}
//
//- (SKSpriteNode *)imageFor:(Button)button withHeight:(float)height {
//    SKSpriteNode *buttonSprite;
//    float r = 1.0;
//    switch (button) {
//        case LOGO:
//            buttonSprite = [SKSpriteNode spriteNodeWithImageNamed:@"logo.png"];
//            r = 2000 / 322;
//            break;
//        case START:
//            buttonSprite = [SKSpriteNode spriteNodeWithImageNamed:@"start.png"];
//            r = 213 / 55;
//            break;
//        case RESTART:
//            buttonSprite = [SKSpriteNode spriteNodeWithImageNamed:@"restart.png"];
//            r = 213 / 55;
//            break;
//        default:
//            break;
//    }
//    buttonSprite.size = CGSizeMake(height * r, height);
//    return buttonSprite;
//}
//
//- (Button)buttonIn:(CGPoint)location {
//    Button result = NONE;
//    if (start && isInside(location, start)) {
//        result = START;
//    } else if (restart && isInside(location, restart)) {
//        result = RESTART;
//    }
//    return result;
//}
//
//- (UIImage *)getScreenshotWithBlur:(id)blur scene:(SKScene *)scene {
//    UIGraphicsBeginImageContextWithOptions(scene.view.bounds.size, NO, 1);
//    [scene.view drawViewHierarchyInRect:scene.view.frame afterScreenUpdates:YES];
//    UIImage *ss = UIGraphicsGetImageFromCurrentImageContext();
//    UIGraphicsEndImageContext();
//    
//    CIFilter *gaussianBlurFilter = [CIFilter filterWithName:@"CIGaussianBlur"];
//    [gaussianBlurFilter setDefaults];
//    [gaussianBlurFilter setValue:[CIImage imageWithCGImage:[ss CGImage]] forKey:kCIInputImageKey];
//    [gaussianBlurFilter setValue:blur forKey:kCIInputRadiusKey];
//    
//    CIImage *outputImage = [gaussianBlurFilter outputImage];
//    CIContext *context   = [CIContext contextWithOptions:nil];
//    CGRect rect          = [outputImage extent];
//    rect.origin.x        += (rect.size.width  - ss.size.width ) / 2;
//    rect.origin.y        += (rect.size.height - ss.size.height) / 2;
//    rect.size            = ss.size;
//    CGImageRef cgimg     = [context createCGImage:outputImage fromRect:rect];
//    UIImage *image       = [UIImage imageWithCGImage:cgimg];
//    CGImageRelease(cgimg);
//    return image;
//}
//
//float isInside(CGPoint p, SKSpriteNode *obj) {
//    return (p.x > obj.position.x - obj.size.width / 2 && p.x < obj.position.x + obj.size.width / 2 + obj.size.width && p.y > obj.position.y - obj.size.height / 2 && p.y < obj.position.y + obj.size.height / 2) ? YES : NO;
//}
//
//@end
