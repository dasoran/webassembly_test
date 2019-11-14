(module
    (memory (import "js" "mem") 1)
    (func (export "proceedOperator") (param $o_vec i32) (param $o_mat i32) (param $o_ret i32) (param $len i32) (result i32)
        (local $i i32)
        (local $j i32)
        (local $local_result f64)
        (set_local $i (i32.const 0))
        (block $i_break (loop $i_top
            (br_if $i_break (i32.eq (get_local $i) (get_local $len)))
            (set_local $j (i32.const 0))
            (block $j_break (loop $j_top
                (br_if $j_break (i32.eq (get_local $j) (get_local $len)))
                (call $mul_complex
                    (i32.add (get_local $o_vec) (get_local $j))
                    (i32.add
                        (get_local $o_mat)
                        (i32.add (get_local $j) (i32.mul (get_local $i) (get_local $len)))
                    )
                    (i32.add (get_local $o_ret) (get_local $j))
                )
                (set_local $j (i32.add (get_local $j) (i32.const 1)))
                (br $j_top)
            ))
            (set_local $i (i32.add (get_local $i) (i32.const 1)))
            (br $i_top)
      ))
      (get_local $o_vec)
    )
    (func $mul_complex (param $x_ptr_raw i32) (param $y_ptr_raw i32) (param $ret_ptr_raw i32) (result)
        (local $real f64)
        (local $im f64)
        (local $x_ptr i32)
        (local $y_ptr i32)
        (local $ret_ptr i32)
        (set_local $x_ptr (i32.shl (get_local $x_ptr_raw) (i32.const 1)))
        (set_local $y_ptr (i32.shl (get_local $y_ptr_raw) (i32.const 1)))
        (set_local $ret_ptr (i32.shl (get_local $ret_ptr_raw) (i32.const 1)))
        (set_local
            $real
                (f64.sub
                    (f64.mul
                        (f64.load (call $f64_addr (get_local $x_ptr)))
                        (f64.load (call $f64_addr (get_local $y_ptr)))
                    )
                    (f64.mul
                        (f64.load (call $f64_addr
                            (i32.add (get_local $x_ptr) (i32.const 1)))
                        )
                        (f64.load (call $f64_addr
                            (i32.add (get_local $y_ptr) (i32.const 1)))
                        )
                    )
                )
        )
        (set_local 
            $im
                (f64.add
                    (f64.mul
                        (f64.load (call $f64_addr (get_local $x_ptr)))
                        (f64.load (call $f64_addr
                            (i32.add (get_local $y_ptr) (i32.const 1)))
                        )
                    )
                    (f64.mul
                        (f64.load (call $f64_addr
                            (i32.add (get_local $x_ptr) (i32.const 1)))
                        )
                        (f64.load (call $f64_addr(get_local $y_ptr)))
                    )
                )
        )
        (f64.store
            (call $f64_addr (get_local $ret_ptr))
            (get_local $real)
        )
        (f64.store
            (call $f64_addr (i32.add (get_local $ret_ptr) (i32.const 1)))
            (get_local $im)
        )
    )
    (func $f64_addr (param $ptr i32) (result i32)
        (i32.shl (get_local $ptr) (i32.const 3))
    )
)

