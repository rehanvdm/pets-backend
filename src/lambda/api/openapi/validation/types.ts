/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Pet {
  id: number;
  type: string;
  name: string;
}

export namespace Pets {
  /**
   * @description Get all pets
   * @name GetPets
   * @request GET:/pets
   * @response `200` `(Pet)[]` Success
   */
  export namespace GetPets {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Pet[];
  }
  /**
   * @description Get a pet by ID
   * @name GetPetById
   * @request GET:/pets/{id}
   * @response `200` `Pet` Success
   */
  export namespace GetPetById {
    export type RequestParams = { id: number };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = Pet;
  }
}
