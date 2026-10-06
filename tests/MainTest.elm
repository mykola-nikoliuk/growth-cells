module MainTest exposing (suite)

import Expect
import Html.Attributes as Attr
import Json.Encode as E
import Main
import Test exposing (Test, describe, test)
import Test.Html.Query as Query
import Test.Html.Selector exposing (attribute, tag, text)


render : E.Value -> Query.Single Main.Msg
render flags =
    Main.init flags |> Tuple.first |> Main.view |> Query.fromHtml


validConfig : E.Value
validConfig =
    E.object
        [ ( "startCells", E.int 4 )
        , ( "epochs", E.int 10 )
        , ( "splitChance", E.float 1 )
        , ( "splitPeriod", E.float 2 )
        ]


{-| Renders the page after `msgs` arrive, one after another.
-}
renderAfterAll : List Main.Msg -> E.Value -> Query.Single Main.Msg
renderAfterAll msgs flags =
    List.foldl (\msg model -> Main.update msg model |> Tuple.first) (Main.init flags |> Tuple.first) msgs
        |> Main.view
        |> Query.fromHtml


renderAfter : { epoch : Int, total : Int, marked : Int } -> E.Value -> Query.Single Main.Msg
renderAfter progress =
    renderAfterAll [ Main.EpochChanged progress ]


suite : Test
suite =
    describe "Main"
        [ test "names the page" <|
            \_ -> Expect.equal "Growth Cells" Main.title
        , test "shows the largest population for a valid config" <|
            \_ ->
                render validConfig
                    |> Query.has [ text "Up to 4096 cells" ]
        , test "starts at epoch 0 with the starting cells" <|
            \_ ->
                render validConfig
                    |> Query.has [ text "Epoch 0 · 4 cells" ]
        , test "shows the progress the simulation reports" <|
            \_ ->
                renderAfter { epoch = 3, total = 32, marked = 0 } validConfig
                    |> Query.has [ text "Epoch 3 · 32 cells" ]
        , test "ignores progress while the config is invalid" <|
            \_ ->
                renderAfter { epoch = 3, total = 32, marked = 0 } (E.object [])
                    |> Query.findAll [ tag "li" ]
                    |> Query.count (Expect.equal 4)
        , test "fills the form with the config it started from" <|
            \_ ->
                render validConfig
                    |> Query.findAll [ tag "input" ]
                    |> Expect.all
                        [ Query.index 0 >> Query.has [ attribute (Attr.value "4") ]
                        , Query.index 1 >> Query.has [ attribute (Attr.value "10") ]
                        , Query.index 2 >> Query.has [ attribute (Attr.value "1") ]
                        , Query.index 3 >> Query.has [ attribute (Attr.value "2") ]
                        ]
        , test "restarts from the edited form, back at epoch 0" <|
            \_ ->
                renderAfterAll
                    [ Main.EpochChanged { epoch = 3, total = 32, marked = 0 }
                    , Main.FieldChanged Main.StartCells "8"
                    , Main.FieldChanged Main.Epochs "4"
                    , Main.Restart
                    ]
                    validConfig
                    |> Query.has [ text "Up to 128 cells", text "Epoch 0 · 8 cells" ]
        , test "shows why an edited form cannot start" <|
            \_ ->
                renderAfterAll [ Main.FieldChanged Main.StartCells "lots", Main.Restart ] validConfig
                    |> Query.has [ text "\"startCells\" must be a whole number from 1 to 64." ]
        , test "keeps what was typed after a failed restart" <|
            \_ ->
                renderAfterAll [ Main.FieldChanged Main.StartCells "lots", Main.Restart ] validConfig
                    |> Query.findAll [ tag "input" ]
                    |> Query.first
                    |> Query.has [ attribute (Attr.value "lots") ]
        , test "lists every problem in an invalid config" <|
            \_ ->
                render (E.object [])
                    |> Query.findAll [ tag "li" ]
                    |> Query.count (Expect.equal 4)
        ]
