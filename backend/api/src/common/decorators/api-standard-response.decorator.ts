import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { StandardResponse } from '../dto/standard-response.dto';
import { ErrorResponse } from '../dto/error-response.dto';

export const ApiStandardResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray = false,
  status: 'ok' | 'created' = 'ok',
) => {
  const ResponseDecorator =
    status === 'created' ? ApiCreatedResponse : ApiOkResponse;

  return applyDecorators(
    ApiExtraModels(StandardResponse, model, ErrorResponse),
    ResponseDecorator({
      description: 'Successful response',
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties: {
              data: isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad Request',
      type: ErrorResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorResponse,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ErrorResponse,
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      type: ErrorResponse,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      type: ErrorResponse,
    }),
  );
};
