import { fromNullable, getOrElse, Option, some, none, sequenceArray } from 'fp-ts/lib/Option';
import { TaskEither, right, map, chain, mapLeft, tryCatch } from 'fp-ts/TaskEither';
import Form from '../models/form';
import { IForm } from '../types/form';


interface FormRepo {
    getForms(): TaskEither<Error, Option<Readonly<Array<IForm>>>>;
    addForm(body: IForm): TaskEither<Error, Readonly<IForm>>;
}

class FormRepoImpl implements FormRepo {
    private static instance: FormRepoImpl;
    private constructor() {
    }

    static of(): FormRepoImpl {
        return getOrElse(() => new FormRepoImpl())(fromNullable(FormRepoImpl.instance))
    };

    getForms(): TaskEither<Error, Option<Readonly<Array<IForm>>>> {
        return tryCatch(
            async () => {
                const resultArray: Array<IForm> = [];
                for await (let k of Form.find()) {
                    resultArray.push(k);
                }
                return some(resultArray);
            },
            e => new Error(`Failed to get forms: ${e}`)
        );
    }

    /**
     * addForm :: IForm -> TaskEither Error Form
     * @param formBody - the form data
     * @throws error when creating a form
     */
    addForm(body: IForm): TaskEither<Error, Readonly<IForm>> {
        return tryCatch(
            () => Form.create(body),
            e => new Error(`Failed to create a form: ${e}`)
        );
    }

}

const formOf: (reqBody: any) => Readonly<IForm> =
    (reqBody) => ({
        apiId: reqBody.apiId,
        subscriberId: reqBody.subscriberId,
        submitUser: reqBody.submitUser,
        status: reqBody.status,
        approver: reqBody.approver,
        approveDate: reqBody.approveDate,
        comment: reqBody.comment
    });

    
export { FormRepoImpl, formOf }