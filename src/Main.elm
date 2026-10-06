port module Main exposing (Field(..), Msg(..), init, main, title, update, view)

import Browser
import Config exposing (Config)
import Html exposing (Html, button, div, form, h1, input, label, li, p, span, text, ul)
import Html.Attributes exposing (class, type_, value)
import Html.Events exposing (onInput, onSubmit)
import Json.Decode exposing (Value)
import Json.Encode as E


title : String
title =
    "Growth Cells"


main : Program Value Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }


type alias Progress =
    { epoch : Int, total : Int, marked : Int }


{-| The settings as typed: kept as text, so a half-typed number is not lost or rejected early.
-}
type alias Form =
    { startCells : String
    , epochs : String
    , splitChance : String
    , splitPeriod : String
    }


type Field
    = StartCells
    | Epochs
    | SplitChance
    | SplitPeriod


type State
    = Invalid (List String)
    | Ready Config Progress


type alias Model =
    { form : Form
    , state : State
    }


type Msg
    = EpochChanged Progress
    | FieldChanged Field String
    | Restart


init : Value -> ( Model, Cmd Msg )
init flags =
    let
        ( state, cmd ) =
            start flags
    in
    ( { form = formFrom state, state = state }, cmd )


{-| Validates a config and, when it is valid, starts the simulation from it.
-}
start : Value -> ( State, Cmd Msg )
start json =
    case Config.decode json of
        Ok config ->
            ( Ready config { epoch = 0, total = config.startCells, marked = 0 }, restart config )

        Err errors ->
            ( Invalid errors, Cmd.none )


formFrom : State -> Form
formFrom state =
    case state of
        Ready config _ ->
            { startCells = String.fromInt config.startCells
            , epochs = String.fromInt config.epochs
            , splitChance = String.fromFloat config.splitChance
            , splitPeriod = String.fromFloat config.splitPeriod
            }

        Invalid _ ->
            { startCells = "", epochs = "", splitChance = "", splitPeriod = "" }


{-| The form as a JSON config, so it goes through the same validation as any other config.
Text that is not a number is passed on as text, and the validation reports it.
-}
encodeForm : Form -> Value
encodeForm draft =
    let
        number raw =
            case String.toFloat (String.trim raw) of
                Just n ->
                    E.float n

                Nothing ->
                    E.string raw
    in
    E.object
        [ ( "startCells", number draft.startCells )
        , ( "epochs", number draft.epochs )
        , ( "splitChance", number draft.splitChance )
        , ( "splitPeriod", number draft.splitPeriod )
        ]


setField : Field -> String -> Form -> Form
setField field raw draft =
    case field of
        StartCells ->
            { draft | startCells = raw }

        Epochs ->
            { draft | epochs = raw }

        SplitChance ->
            { draft | splitChance = raw }

        SplitPeriod ->
            { draft | splitPeriod = raw }


subscriptions : Model -> Sub Msg
subscriptions _ =
    epochChanged EpochChanged


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        EpochChanged progress ->
            case model.state of
                Ready config _ ->
                    ( { model | state = Ready config progress }, Cmd.none )

                Invalid _ ->
                    ( model, Cmd.none )

        FieldChanged field raw ->
            ( { model | form = setField field raw model.form }, Cmd.none )

        Restart ->
            let
                ( state, cmd ) =
                    start (encodeForm model.form)
            in
            ( { model | state = state }, cmd )


view : Model -> Html Msg
view model =
    div [ class "panel" ]
        [ viewState model.state
        , viewForm model.form
        ]


viewState : State -> Html Msg
viewState state =
    case state of
        Ready config progress ->
            let
                summary =
                    "Up to " ++ String.fromInt (config.startCells * 2 ^ config.epochs) ++ " cells"

                status =
                    "Epoch "
                        ++ String.fromInt progress.epoch
                        ++ " · "
                        ++ String.fromInt progress.total
                        ++ " cells"
            in
            div []
                [ h1 [] [ text summary ]
                , p [ class "status" ] [ text status ]
                ]

        Invalid errors ->
            ul [ class "errors" ] (List.map (\e -> li [] [ text e ]) errors)


viewForm : Form -> Html Msg
viewForm draft =
    form [ onSubmit Restart ]
        [ viewField "Start cells" StartCells draft.startCells
        , viewField "Epochs" Epochs draft.epochs
        , viewField "Split chance" SplitChance draft.splitChance
        , viewField "Split period, s" SplitPeriod draft.splitPeriod
        , button [ type_ "submit" ] [ text "Restart" ]
        ]


viewField : String -> Field -> String -> Html Msg
viewField caption field raw =
    label []
        [ span [] [ text caption ]
        , input [ value raw, onInput (FieldChanged field) ] []
        ]


port restart : Config -> Cmd msg


port epochChanged : (Progress -> msg) -> Sub msg
