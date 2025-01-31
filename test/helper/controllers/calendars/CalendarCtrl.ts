import {
    Controller, Get, Post, Put, Delete,
    PathParams, Request, Response,
    BodyParams, Required, Use, Header, Next, Authenticated,
    CookiesParams, QueryParams,
    RouterController,
    IPromise
} from "../../../../src/index";

import {$log} from "ts-log-debug";
import * as Express from "express";
import {EventCtrl} from "./EventCtrl";
import {MongooseService} from "../../services/MongooseService"

interface ICalendar {
    id: string;
    name: string;
}
/**
 * Add @Controller annotation to declare your class as Router controller. The first param is the global path for your controller.
 * The others params is the controller depedencies.
 *
 * In this case, EventCtrl is a depedency of CalendarCtrl. All routes of EventCtrl will be mounted on the `/calendars` path.
 */
@Controller("/calendars", EventCtrl)
export class CalendarCtrl {

    constructor(
        private mongooseService: MongooseService,
        private routerController: RouterController
    ) {

        //
        const router = this.routerController.getRouter();
        
    }
    /**
     * Example of classic call. Use `@Get` for routing a request to your method.
     * In this case, this route "/calendar/classic/:id" are mounted on the "rest/" path (call /rest/calendar/classic/:id
     * to test your service).
     *
     * By default, the response is sent with status 200 and is serialized in JSON.
     *
     * @param request
     * @param response
     * @returns {{id: any, name: string}}
     */
    @Get("/classic/:id")
    public findClassic(request: any, response: any): ICalendar {

        return {id: request.params.id, name: "test"};
    }

    @Get("/token")
    public getToken(
        @CookiesParams("authorization") authorization: string
    ): string {

        if (authorization){
            const token = this.mongooseService.token();
            return token;
            //console.log('TOKEN', this.mongooseService, token);
        }

        return "";
    }

    @Get("/token/:token")
    public updateToken(
        @PathParams("token") token: string
    ): string {
        this.mongooseService.token(token);
        return 'token updated';
    }


    @Get("/query")
    public getQuery(
        @QueryParams("search") search: string,
        @Request() request
    ): string {

        return search || "EMPTY";
    }
    /**
     * Example of customised call. You can use decorators to inject express object like `response` as `@Response`,
     * `request` as `@Request` and `next` as `@Next`.
     *
     * Another decorator are available to access quickly to the pathParams request. `@PathParams` take an expression in
     * first parameter.
     *
     * @param request
     * @param id
     * @param next
     * @param response
     * @returns {{id: any, name: string}}
     */

    @Get("/annotation/test/:id")
    public findWithAnnotation(
        @Request() request: Express.Request,
        @Response() response: Express.Response,
        @PathParams("id") @Required() id: string,
        @Next() next: Express.NextFunction
    ): void {

        response.status(200).json({id: id, name: "test"});

        next();
    }

    /**
     * Your method can return a Promise to respond to a request.
     *
     * By default, the response is sent with status 200 and is serialized in JSON.
     *
     * @param request
     * @param id
     * @returns {Promise<ICalendar>}
     */
    @Get("/annotation/promised/:id")
    public findWithPromise(
        @Request() request,
        @PathParams("id") id
    ): IPromise<ICalendar> {

        $log.debug("ID =>", id, request.params.id);

        //
        return new Promise<ICalendar>((resolve, reject) => {


            resolve({
                id: id,
                name: "test"
            });
        });
    }

    /**
     * Your method can return a Promise to respond to a request.
     *
     * By default, the response is sent with status 200 and is serialized in JSON.
     *
     * @param request Express request
     * @param response Express response
     * @param id
     * @returns {Promise<ICalendar>}
     */
    @Get("/annotation/status/:id")
    public findAndChangeStatusCode(
        @Request() request: Express.Request,
        @Response() response: Express.Response,
        @PathParams("id") id: string
    ): IPromise<ICalendar> {

        //$log.debug("ID =>", id, request.params.id);
        //
        return new Promise<ICalendar>((resolve, reject) => {

            response.status(202);

            resolve({
                id: id,
                name: "test"
            });
        });
    }

    /**
     *
     * @param request
     * @returns {{user: (number|any|string)}}
     */
    @Get("/middleware")
    @Use(CalendarCtrl.middleware)
    public getWithMiddleware(
        @Request() request,
        @Header("authorization") auth: string
    ): any {

        return {
            user: request.user,
            token: auth
        };
    }

    /**
     *
     * @param auth
     * @param name
     * @returns {{id: number, name: string}}
     */
    @Put("/")
    public save(
        @BodyParams("name") @Required() name: string
    ): any {

        return {id: 2, name: name};
    }


    @Delete("/")
    @Authenticated({role: "admin"})
    public remove(
        @BodyParams("id") @Required() id: string
    ): any {
        return {id: id, name: "test"};
    }



    static middleware(request: Express.Request, response: Express.Response, next: Express.NextFunction){

        (<any>request).user = 1;

        //console.log(request.headers)
        next();
    }
}